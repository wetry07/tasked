document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const tasksList = document.getElementById('tasksList');
    const themeToggle = document.getElementById('themeToggle');
    const searchInput = document.getElementById('searchInput');
    const dueDateInput = document.getElementById('dueDate');
    const prioritySelect = document.getElementById('priority');
    const tagsInput = document.getElementById('tags');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const notification = document.getElementById('notification');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    let currentFilter = 'all';

    // Initialize theme
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // Functions
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function showNotification(message, duration = 3000) {
        const notificationEl = document.getElementById('notification');
        notificationEl.querySelector('.notification-message').textContent = message;
        notificationEl.classList.add('show');
        
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, duration);
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const priorityClass = `priority-${task.priority || 'low'}`;
        const tags = task.tags ? task.tags.split(',').map(tag => tag.trim()) : [];
        
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-details">
                    ${task.dueDate ? `
                        <div class="task-due-date">
                            <i class="far fa-calendar"></i>
                            ${formatDate(task.dueDate)}
                        </div>
                    ` : ''}
                    <div class="task-priority">
                        <span class="priority-indicator ${priorityClass}"></span>
                        ${task.priority || 'low'}
                    </div>
                    ${tags.length > 0 ? `
                        <div class="task-tags">
                            <i class="fas fa-tag"></i>
                            ${tags.join(', ')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${task.id}" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add hover effect for mobile
        taskElement.addEventListener('touchstart', () => {
            taskElement.style.transform = 'scale(0.98)';
        });

        taskElement.addEventListener('touchend', () => {
            taskElement.style.transform = '';
        });

        return taskElement;
    }

    function addTask(text, dueDate, priority, tags) {
        if (text.trim() === '') return;
        
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            dueDate: dueDate,
            priority: priority,
            tags: tags,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        showNotification('Task added successfully!');
        
        // Clear inputs
        taskInput.value = '';
        dueDateInput.value = '';
        prioritySelect.value = 'low';
        tagsInput.value = '';
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                const updatedTask = { ...task, completed: !task.completed };
                showNotification(updatedTask.completed ? 'Task completed!' : 'Task uncompleted');
                return updatedTask;
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        taskInput.value = task.text;
        dueDateInput.value = task.dueDate || '';
        prioritySelect.value = task.priority || 'low';
        tagsInput.value = task.tags || '';
        
        // Remove the task and focus the input
        deleteTask(id, false); // false to prevent notification
        taskInput.focus();
    }

    function deleteTask(id, showNotify = true) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        if (showNotify) {
            showNotification('Task deleted');
        }
    }

    function filterTasks(tasks) {
        const searchTerm = searchInput.value.toLowerCase();
        
        return tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(searchTerm);
            const matchesFilter = currentFilter === 'all' || 
                (currentFilter === 'active' && !task.completed) ||
                (currentFilter === 'completed' && task.completed);
            
            return matchesSearch && matchesFilter;
        });
    }

    function renderTasks() {
        const filteredTasks = filterTasks(tasks);
        tasksList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="no-tasks">
                    <p>No tasks found</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            tasksList.appendChild(createTaskElement(task));
        });
    }

    // Event Listeners
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(
                taskInput.value,
                dueDateInput.value,
                prioritySelect.value,
                tagsInput.value
            );
        }
    });

    addTaskBtn.addEventListener('click', () => {
        if (taskInput.value.trim() !== '') {
            addTask(
                taskInput.value,
                dueDateInput.value,
                prioritySelect.value,
                tagsInput.value
            );
        } else {
            taskInput.focus();
        }
    });

    tasksList.addEventListener('click', (e) => {
        const target = e.target.closest('.task-checkbox, .edit-btn, .delete-btn');
        if (!target) return;

        const id = parseInt(target.dataset.id);

        if (target.classList.contains('task-checkbox')) {
            toggleTask(id);
        } else if (target.classList.contains('edit-btn')) {
            editTask(id);
        } else if (target.classList.contains('delete-btn')) {
            deleteTask(id);
        }
    });

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode);
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        const icon = themeToggle.querySelector('i');
        icon.classList.replace(
            isDarkMode ? 'fa-moon' : 'fa-sun',
            isDarkMode ? 'fa-sun' : 'fa-moon'
        );
    });

    searchInput.addEventListener('input', renderTasks);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Initial render
    renderTasks();
}); 