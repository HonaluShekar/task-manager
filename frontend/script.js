const BASE = "https://task-manager-2v3w.onrender.com";

let token = "";

// LOGIN
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${BASE}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log("LOGIN RESPONSE:", data);

        if (data.token) {
            token = data.token;

            document.getElementById("loginPage").style.display = "none";
            document.getElementById("app").classList.remove("hidden");

            getTasks();
        } else {
            alert(data.message || "Login failed");
        }
    })
    .catch(err => console.error("Login error:", err));
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

    fetch(`${BASE}/add_task`, {
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
        console.log("ADD TASK:", data);

        alert(data.message || "Task added");

        // clear fields
        document.getElementById("title").value = "";
        document.getElementById("desc").value = "";
        document.getElementById("date").value = "";

        getTasks();
    })
    .catch(err => console.error("Add error:", err));
}

// GET TASKS
function getTasks() {
    fetch(`${BASE}/tasks`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log("TASKS:", data);

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
    .catch(err => console.error("Fetch error:", err));
}

// UPDATE TASK
function updateTask(id) {
    fetch(`${BASE}/update_task/${id}`, {
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
        console.log("UPDATE:", data);
        getTasks();
    })
    .catch(err => console.error("Update error:", err));
}

// DELETE TASK
function deleteTask(id) {
    fetch(`${BASE}/delete_task/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log("DELETE:", data);
        getTasks();
    })
    .catch(err => console.error("Delete error:", err));
}