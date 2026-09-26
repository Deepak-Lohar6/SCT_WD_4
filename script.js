document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const taskCategory = document.getElementById("taskCategory");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");
    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const pendingTasks = document.getElementById("pendingTasks");
    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");
    const searchTask = document.getElementById("searchTask");
    const popup = document.getElementById("popup");
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    let tasks = JSON.parse(localStorage.getItem("tf_tasks")) || [];
    let currentTheme = localStorage.getItem("tf_theme") || "dark";

    function init() {
        applyTheme();
        refreshUI();
    }

    function saveTasks() {
        localStorage.setItem("tf_tasks", JSON.stringify(tasks));
    }

    function saveTheme() {
        localStorage.setItem("tf_theme", currentTheme);
    }

    function applyTheme() {
        if (currentTheme === "light") {
            document.body.classList.add("light-mode");
            themeIcon.textContent = "🌙";
        } else {
            document.body.classList.remove("light-mode");
            themeIcon.textContent = "☀️";
        }
    }

    themeToggle.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        saveTheme();
        applyTheme();
    });

    function refreshUI(filteredTasks = null) {
        const dataset = filteredTasks || tasks;
        renderTasks(dataset);
        updateStats();
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        totalTasks.textContent = total;
        completedTasks.textContent = completed;
        pendingTasks.textContent = pending;
        progressPercent.textContent = `${percentage}%`;
        progressFill.style.width = `${percentage}%`;

        if (total === 0) {
            emptyState.style.display = "block";
            taskList.style.display = "none";
        } else {
            emptyState.style.display = "none";
            taskList.style.display = "grid";
        }
    }

    function renderTasks(dataset) {
        taskList.innerHTML = "";

        if (dataset.length === 0 && tasks.length > 0) {
            taskList.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        dataset.forEach(task => {
            const card = document.createElement("article");
            card.className = `task-card ${task.completed ? 'completed' : ''}`;

            card.innerHTML = `
                <div class="title-container">
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>
                </div>
                <div class="task-meta">
                    <span class="badge">${task.category}</span>
                    <span class="date">${task.date}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-complete">${task.completed ? "Undo" : "Complete"}</button>
                    <button class="btn-edit">Edit</button>
                    <button class="btn-delete">Delete</button>
                </div>
            `;

            const completeBtn = card.querySelector(".btn-complete");
            const editBtn = card.querySelector(".btn-edit");
            const deleteBtn = card.querySelector(".btn-delete");
            const titleContainer = card.querySelector(".title-container");

            completeBtn.addEventListener("click", () => toggleTask(task.id));
            deleteBtn.addEventListener("click", () => deleteTask(task.id));

            editBtn.addEventListener("click", () => {
                if (card.classList.contains("editing")) {
                    const editInput = titleContainer.querySelector(".edit-input");
                    const newTitle = editInput.value.trim();
                    if (newTitle !== "") {
                        task.title = newTitle;
                        saveTasks();
                        refreshUI();
                        showToast("Task updated!");
                    } else {
                        showToast("Task title cannot be empty.");
                    }
                } else {
                    card.classList.add("editing");
                    titleContainer.innerHTML = `<input type="text" class="edit-input" value="${escapeHTML(task.title)}">`;
                    const editInput = titleContainer.querySelector(".edit-input");
                    editInput.focus();
                    editBtn.textContent = "Save";
                    editBtn.style.background = "#22C55E";

                    editInput.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") {
                            editBtn.click();
                        }
                    });
                }
            });

            taskList.appendChild(card);
        });
    }

    function addTask() {
        const title = taskInput.value.trim();
        if (!title) {
            showToast("Please enter a task.");
            return;
        }

        const newTask = {
            id: Date.now(),
            title: title,
            category: taskCategory.value,
            completed: false,
            date: new Date().toLocaleDateString()
        };

        tasks.push(newTask);
        saveTasks();
        refreshUI();
        taskInput.value = "";
        showToast("Task added successfully!");
    }

    function toggleTask(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveTasks();
        refreshUI();
    }

    function deleteTask(id) {
        if (!confirm("Delete this task?")) return;
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        refreshUI();
        showToast("Task deleted.");
    }

    function showToast(msg) {
        popup.textContent = msg;
        popup.classList.add("show");
        setTimeout(() => popup.classList.remove("show"), 2500);
    }

    searchTask.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const filtered = tasks.filter(t => 
            t.title.toLowerCase().includes(keyword) || 
            t.category.toLowerCase().includes(keyword)
        );
        refreshUI(filtered);
    });

    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addTask();
    });

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    init();
});