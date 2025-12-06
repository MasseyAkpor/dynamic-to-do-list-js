document.addEventListener('DOMContentLoaded', function() {
    
    const addButton = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    function addTask() {
        const taskInput = document.getElementById('task-input');
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            alert('Please enter a task.');
            return;
        }

        const listItem = document.createElement('li');
        listItem.textContent = taskText;

        const RemoveBtn = document.createElement('button');
        RemoveBtn.textContent = 'Remove';
        RemoveBtn.className = 'remove-btn';

        RemoveBtn.onclick = function() {
            listItem.remove();
        };
        listItem.appendChild(RemoveBtn);
        taskList.appendChild(listItem);
        taskInput.value = '';
    }

    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    storedTasks.forEach(taskText => addTask(taskText, false)); // 'false' indicates not to save again to Local Storage
}

// Adjust `addTask` to optionally save tasks to avoid duplication when loading from Local Storage
function addTask(taskText, save = true) {
    // Task creation logic remains the same

    if (save) {
        const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        storedTasks.push(taskText);
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    // Other initialization code
});
});