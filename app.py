from flask import Flask, request, jsonify
from models import db, User, Task
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = 'secretkey123'
jwt = JWTManager(app)

# Database setup
base_dir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(base_dir, "tasks.db")

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# ------------------ APIs ------------------

# 1. REGISTER
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid input"}), 400

    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 400

    user = User(
        name=data.get('name'),
        email=data.get('email'),
        password=data.get('password')
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})


# 2. LOGIN
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid input"}), 400

    user = User.query.filter_by(
        email=data.get('email'),
        password=data.get('password')
    ).first()

    if user:
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "message": "Login successful",
            "access_token": access_token   # ✅ FIXED
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# 3. ADD TASK
@app.route('/add_task', methods=['POST'])
@jwt_required()
def add_task():
    user_id = get_jwt_identity()
    data = request.get_json()

    task = Task(
        user_id=user_id,
        task_title=data.get('task_title'),
        description=data.get('description', ''),
        status="Pending",
        due_date=data.get('due_date', '')
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Task added successfully"})


# 4. GET TASKS
@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()

    tasks = Task.query.filter_by(user_id=user_id).all()

    output = []
    for t in tasks:
        output.append({
            "id": t.id,
            "title": t.task_title,
            "status": t.status
        })

    return jsonify(output)


# 5. UPDATE TASK
@app.route('/update_task/<int:id>', methods=['PUT'])
@jwt_required()
def update_task(id):
    user_id = get_jwt_identity()

    task = Task.query.filter_by(id=id, user_id=user_id).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    data = request.get_json()
    task.status = data.get("status", "Completed")

    db.session.commit()

    return jsonify({"message": "Task updated successfully"})


# 6. DELETE TASK
@app.route('/delete_task/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_task(id):
    user_id = get_jwt_identity()

    task = Task.query.filter_by(id=id, user_id=user_id).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted successfully"})


# HOME ROUTE
@app.route('/')
def home():
    return "API is working"


# RUN SERVER (IMPORTANT FOR RENDER)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)