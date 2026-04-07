const API_URL = "https://py29vzblk3.execute-api.ap-southeast-2.amazonaws.com/prod/tasks";

let tasks = [];

// ========================
// 1. LOAD TASKS (GET)
// ========================
async function loadTasks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error("API error");

        const result = await response.json();

        tasks = result.data || [];
        renderTasks();

    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Unable to connect to Backend!');
    }
}

// ========================
// 2. RENDER TASKS
// ========================
function renderTasks(filteredTasks = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';

        taskElement.innerHTML = `
            <div class="task-title">${task.title || ''}</div>
            <div class="task-description">${task.description || ''}</div>
            <div class="task-meta">
                <div>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</div>
                <div class="task-priority priority-${task.priority || 'low'}">
                    ${(task.priority || 'low').toUpperCase()}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask('${task.taskId}')">Edit</button>
                <button class="delete-btn" onclick="deleteTask('${task.taskId}')">Delete</button>
            </div>
        `;

        taskList.appendChild(taskElement);
    });
}

// ========================
// 3. ADD TASK (POST)
// ========================
document.getElementById('taskForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const newTask = {
        userId: "user_id",
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value || "",
        dueDate: document.getElementById('taskDueDate').value || null,
        priority: document.getElementById('taskPriority').value || "low"
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) throw new Error("Create failed");

        this.reset();
        await loadTasks();

    } catch (error) {
        console.error('Error adding task:', error);
        alert("Failed to create task!");
    }
});

// ========================
// 4. DELETE TASK
// ========================
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Delete failed");

        await loadTasks();

    } catch (error) {
        console.error('Error deleting task:', error);
        alert("Deletion failed!");
    }
}

// ========================
// 5. EDIT TASK (PUT)
// ========================
function editTask(taskId) {
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;

    // Fill form
    document.getElementById('editTitle').value = task.title || '';
    document.getElementById('editDescription').value = task.description || '';

    // format YYYY-MM-DD cho input date
    document.getElementById('editDueDate').value =
        task.dueDate ? task.dueDate.split('T')[0] : '';

    document.getElementById('editPriority').value = task.priority || 'low';

    document.getElementById('editModal').style.display = 'block';

    document.getElementById('editForm').onsubmit = async function(e) {
        e.preventDefault();

        const updatedData = {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            dueDate: document.getElementById('editDueDate').value || null,
            priority: document.getElementById('editPriority').value
        };

        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error("Update failed");

            document.getElementById('editModal').style.display = 'none';
            await loadTasks();

        } catch (error) {
            console.error('Error updating:', error);
            alert("Update failed!");
        }
    };
}

// ========================
// FILTER
// ========================
function applyFilters() {
    const priorityFilter = document.getElementById('filterPriority').value;
    const dueDateFilter = document.getElementById('filterDueDate').value;

    let filteredTasks = tasks;

    if (priorityFilter)
        filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);

    if (dueDateFilter)
        filteredTasks = filteredTasks.filter(t =>
            t.dueDate && t.dueDate.startsWith(dueDateFilter)
        );

    renderTasks(filteredTasks);
}

document.getElementById('filterPriority').addEventListener('change', applyFilters);
document.getElementById('filterDueDate').addEventListener('change', applyFilters);

document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterDueDate').value = '';
    renderTasks();
});

document.querySelector('.close').onclick = () =>
    document.getElementById('editModal').style.display = 'none';

loadTasks();