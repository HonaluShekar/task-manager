let token = "";

// LOGIN
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            token = data.token;

            document.getElementById("loginPage").style.display = "none";
            document.getElementById("app").classList.remove("hidden");

            getTasks(); // auto load
        } else {
            alert("Login failed");
        }
    })
    .catch(err => console.log(err));
}

// LOGOUT
function logout() {
    token = "";
    document.getElementById("app").classList.add("hidden");
    document.getElementById("loginPage").style.display = "flex";
}

// ADD TASK
function addTask() {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("desc").value;
    const date = document.getElementById("date").value;

    fetch("http://127.0.0.1:5000/add_task", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            task_title: title,
            description: desc,
            due_date: date
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        getTasks();
    })
    .catch(err => console.log(err));
}

// GET TASKS
function getTasks() {
    fetch("http://127.0.0.1:5000/tasks", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        let list = document.getElementById("taskList");
        list.innerHTML = "";

        data.forEach(task => {
            let li = document.createElement("li");

            li.innerHTML = `
                <span class="${task.status === 'Completed' ? 'completed' : ''}">
                    ${task.title}
                </span>
                <div>
                    <button onclick="updateTask(${task.id})">Complete</button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;

            list.appendChild(li);
        });
    })
    .catch(err => console.log(err));
}

// UPDATE TASK
function updateTask(id) {
    fetch(`http://127.0.0.1:5000/update_task/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            status: "Completed"
        })
    })
    .then(res => res.json())
    .then(data => {
        getTasks();
    })
    .catch(err => console.log(err));
}

// DELETE TASK
function deleteTask(id) {
    fetch(`http://127.0.0.1:5000/delete_task/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        getTasks();
    })
    .catch(err => console.log(err));
}