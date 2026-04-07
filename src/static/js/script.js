// Demo data
let tasks = [
    {
        id: 1,
        title: "Complete project proposal",
        description: "Write and submit the project proposal for the new client.",
        dueDate: "2024-04-15",
        priority: "high"
    },
    {
        id: 2,
        title: "Review code changes",
        description: "Review the pull request for the authentication module.",
        dueDate: "2024-04-10",
        priority: "medium"
    },
    {
        id: 3,
        title: "Update documentation",
        description: "Update the API documentation with the latest changes.",
        dueDate: "2024-04-20",
        priority: "low"
    },
    {
        id: 4,
        title: "Team meeting",
        description: "Attend the weekly team meeting to discuss progress.",
        dueDate: "2024-04-12",
        priority: "medium"
    }
];

// Load tasks from localStorage or use demo data
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    } else {
        saveTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks
function renderTasks(filteredTasks = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                <div>Due: ${new Date(task.dueDate).toLocaleDateString()}</div>
                <div class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

// Add new task
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    
    // Log form data (for future API connection)
    console.log('Adding new task:', { title, description, dueDate, priority });
    
    const newTask = {
        id: Date.now(),
        title,
        description,
        dueDate,
        priority
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Reset form
    this.reset();
});

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description;
    document.getElementById('editDueDate').value = task.dueDate;
    document.getElementById('editPriority').value = task.priority;
    
    document.getElementById('editModal').style.display = 'block';
    
    document.getElementById('editForm').onsubmit = function(e) {
        e.preventDefault();
        
        const title = document.getElementById('editTitle').value;
        const description = document.getElementById('editDescription').value;
        const dueDate = document.getElementById('editDueDate').value;
        const priority = document.getElementById('editPriority').value;
        
        // Log form data (for future API connection)
        console.log('Updating task:', { id, title, description, dueDate, priority });
        
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
        
        saveTasks();
        renderTasks();
        document.getElementById('editModal').style.display = 'none';
    };
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        // Log delete action (for future API connection)
        console.log('Deleting task with ID:', id);
        
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Filter tasks
function applyFilters() {
    const priorityFilter = document.getElementById('filterPriority').value;
    const dueDateFilter = document.getElementById('filterDueDate').value;
    
    let filteredTasks = tasks;
    
    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    if (dueDateFilter) {
        filteredTasks = filteredTasks.filter(task => task.dueDate === dueDateFilter);
    }
    
    renderTasks(filteredTasks);
}

document.getElementById('filterPriority').addEventListener('change', applyFilters);
document.getElementById('filterDueDate').addEventListener('change', applyFilters);

document.getElementById('clearFilters').addEventListener('click', function() {
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterDueDate').value = '';
    renderTasks();
});

// Modal close
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('editModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize
loadTasks();
renderTasks();