from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    # Relationship (optional but good practice)
    tasks = db.relationship('Task', backref='user', lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    task_title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), default="")
    status = db.Column(db.String(50), default="Pending")
    due_date = db.Column(db.String(50), default="")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Task {self.task_title}>"