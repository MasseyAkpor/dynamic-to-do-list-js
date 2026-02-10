document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TaskMaster app initializing...');
    
    // ===== DOM ELEMENTS =====
    // Input elements
    const taskInput = document.getElementById('task-input');
    const addButton = document.getElementById('add-task-btn');
    
    // Task list elements
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    // Stats elements
    const totalTasksSpan = document.getElementById('total-tasks');
    const completedTasksSpan = document.getElementById('completed-tasks');
    const pendingTasksSpan = document.getElementById('pending-tasks');
    
    // Button elements
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    // ===== APP STATE =====
    let tasks = [];
    
    // ===== INITIALIZATION =====
    initializeApp();
    
    function initializeApp() {
        console.log('🔄 Initializing app...');
        
        // Load tasks from localStorage
        loadTasksFromStorage();
        
        // Update stats
        updateStats();
        
        // Set up event listeners
        setupEventListeners();
        
        // Focus on input
        taskInput.focus();
        
        console.log('✅ App initialized successfully!');
    }
    
    // ===== TASK MANAGEMENT =====
    function addTask() {
        const taskText = taskInput.value.trim();
        
        // Validate input
        if (!taskText) {
            showNotification('Please enter a task!', 'warning');
            taskInput.focus();
            return;
        }
        
        // Create task object
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to tasks array
        tasks.push(task);
        
        // Save to localStorage
        saveTasksToStorage();
        
        // Create and render task element
        renderTask(task);
        
        // Clear input and refocus
        taskInput.value = '';
        taskInput.focus();
        
        // Update stats
        updateStats();
        
        // Show success notification
        showNotification('Task added successfully!', 'success');
        
        console.log('✅ Task added:', task);
    }
    
    function renderTask(task) {
        // Validate task object
        if (!task || !task.id || !task.text) {
            console.error('Invalid task object:', task);
            return;
        }
        
        // Create task element
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.dataset.id = task.id;
        
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        // Task HTML structure
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <i class="fas fa-check"></i>
            </div>
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
            </div>
            <div class="task-actions">
                <button class="delete-btn-small">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to task elements
        const checkbox = taskItem.querySelector('.task-checkbox');
        const taskTextEl = taskItem.querySelector('.task-text');
        const deleteBtn = taskItem.querySelector('.delete-btn-small');
        
        // Toggle completion
        const toggleCompletion = () => toggleTaskCompletion(task.id);
        checkbox.addEventListener('click', toggleCompletion);
        taskTextEl.addEventListener('click', toggleCompletion);
        
        // Delete task
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });
        
        // Add to task list
        taskList.appendChild(taskItem);
        
        // Hide empty state
        emptyState.style.display = 'none';
        taskList.style.display = 'block';
        
        // Add animation
        taskItem.style.animation = 'taskAppear 0.4s ease';
    }
    
    function toggleTaskCompletion(taskId) {
        // Find task
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        // Toggle completion status
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // Save to localStorage
        saveTasksToStorage();
        
        // Update UI
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.classList.toggle('completed');
        }
        
        // Update stats
        updateStats();
        
        // Show notification
        const status = tasks[taskIndex].completed ? 'completed' : 'marked as pending';
        showNotification(`Task ${status}!`, 'success');
    }
    
    function deleteTask(taskId) {
        // Find task element
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        
        // Remove from tasks array
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Save to localStorage
        saveTasksToStorage();
        
        // Animation for removal if element exists
        if (taskItem) {
            taskItem.style.transform = 'translateX(100%)';
            taskItem.style.opacity = '0';
            
            // Remove from DOM after animation
            setTimeout(() => {
                taskItem.remove();
                
                // Update stats
                updateStats();
                
                // Show empty state if no tasks
                if (tasks.length === 0) {
                    emptyState.style.display = 'flex';
                    taskList.style.display = 'none';
                }
                
                // Show notification
                showNotification('Task deleted!', 'success');
            }, 300);
        } else {
            // Just update stats if element doesn't exist
            updateStats();
        }
    }
    
    function clearCompletedTasks() {
        // Get completed tasks
        const completedTasks = tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            showNotification('No completed tasks to clear!', 'warning');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
            return;
        }
        
        // Filter out completed tasks
        tasks = tasks.filter(task => !task.completed);
        
        // Save to localStorage
        saveTasksToStorage();
        
        // Remove from DOM with animation
        const completedTaskItems = document.querySelectorAll('.task-item.completed');
        completedTaskItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateX(100%)';
                item.style.opacity = '0';
                setTimeout(() => item.remove(), 300);
            }, index * 100);
        });
        
        // Update stats after animations
        setTimeout(() => {
            updateStats();
            
            // Show empty state if no tasks
            if (tasks.length === 0) {
                emptyState.style.display = 'flex';
                taskList.style.display = 'none';
            }
            
            // Show notification
            showNotification(`Cleared ${completedTasks.length} completed task(s)!`, 'success');
        }, completedTasks.length * 100 + 300);
    }
    
    // ===== STORAGE FUNCTIONS =====
    function loadTasksFromStorage() {
        console.log('📂 Loading tasks from localStorage...');
        
        try {
            // Get tasks from localStorage with error handling
            const storedTasks = localStorage.getItem('tasks');
            
            if (!storedTasks) {
                console.log('No tasks found in localStorage');
                tasks = [];
                return;
            }
            
            // Parse JSON with error handling
            const parsedTasks = JSON.parse(storedTasks);
            
            // Validate and filter tasks
            tasks = Array.isArray(parsedTasks) 
                ? parsedTasks.filter(task => 
                    task && 
                    task.id && 
                    task.text && 
                    typeof task.completed === 'boolean'
                )
                : [];
                
            console.log(`✅ Loaded ${tasks.length} valid tasks from storage`);
            
            // Clear current task list
            taskList.innerHTML = '';
            
            // Render each task
            tasks.forEach(task => {
                renderTask(task);
            });
            
            // Show empty state if no tasks
            if (tasks.length === 0) {
                emptyState.style.display = 'flex';
                taskList.style.display = 'none';
                console.log('📭 No tasks to display');
            } else {
                emptyState.style.display = 'none';
                taskList.style.display = 'block';
                console.log(`📋 Displaying ${tasks.length} tasks`);
            }
            
        } catch (error) {
            console.error('❌ Error loading tasks from localStorage:', error);
            
            // Clear corrupted data
            localStorage.removeItem('tasks');
            tasks = [];
            
            // Reset UI
            taskList.innerHTML = '';
            emptyState.style.display = 'flex';
            taskList.style.display = 'none';
            
            showNotification('Error loading tasks. Storage cleared.', 'error');
        }
    }
    
    function saveTasksToStorage() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            console.log('💾 Saved tasks to localStorage:', tasks.length);
        } catch (error) {
            console.error('❌ Error saving tasks to localStorage:', error);
            showNotification('Error saving tasks!', 'error');
        }
    }
    
    // ===== STATS FUNCTIONS =====
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        if (totalTasksSpan) totalTasksSpan.textContent = total;
        if (completedTasksSpan) completedTasksSpan.textContent = completed;
        if (pendingTasksSpan) pendingTasksSpan.textContent = pending;
        
        console.log('📊 Stats updated:', { total, completed, pending });
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Add task on button click
        if (addButton) {
            addButton.addEventListener('click', addTask);
        }
        
        // Add task on Enter key
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
        }
        
        // Clear completed tasks
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        }
        
        console.log('✅ Event listeners set up');
    }
    
    // ===== HELPER FUNCTIONS =====
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Set icon based on type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        if (type === 'error') icon = 'times-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 3000);
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ===== DEBUG/UTILITY FUNCTIONS =====
    // Clear corrupted localStorage
    window.clearCorruptedData = function() {
        localStorage.removeItem('tasks');
        tasks = [];
        loadTasksFromStorage();
        updateStats();
        showNotification('Corrupted data cleared!', 'success');
    };
    
    // Expose useful functions to console for debugging
    window.taskMaster = {
        addTask: (text) => {
            if (taskInput) {
                taskInput.value = text || 'Test task';
                addTask();
            }
        },
        clearAll: () => {
            tasks = [];
            saveTasksToStorage();
            loadTasksFromStorage();
            updateStats();
            showNotification('All tasks cleared!', 'success');
        },
        getTasks: () => tasks,
        showStats: () => {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            console.log(`Total: ${total}, Completed: ${completed}, Pending: ${total - completed}`);
        }
    };
    
    console.log('🎉 TaskMaster is ready! Try adding a task.');
    
    // Quick test to verify the app works
    setTimeout(() => {
        console.log('🧪 Running self-test...');
        console.log('Elements status:', {
            taskInput: !!taskInput,
            addButton: !!addButton,
            taskList: !!taskList,
            emptyState: !!emptyState
        });
        console.log('Tasks in memory:', tasks.length);
        console.log('✅ Self-test complete');
    }, 100);
});
