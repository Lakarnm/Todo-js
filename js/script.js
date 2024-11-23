"use strict";

// VARIABLES
const todoAdd = document.querySelector('.todo-add-button');
const todoInput = document.querySelector('.todo-input');
const todoSearch = document.querySelector('.todo-search');
const container = document.querySelector('.todo-container');
const modal = document.querySelector('.modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalInput = document.querySelector('.modal-input');
const modalCancel = document.querySelector('.modal-cancel');
const modalApply = document.querySelector('.modal-apply');
const themeButton = document.querySelector('.todo-theme-button');
const deleteAllToggle = document.querySelector('.delete-all-toggle');
const clockElement = document.querySelector('.clock');
const warningModal = document.querySelector('.modal-warning');
const modalContent = document.querySelector('.modal-warning-content');
const warningOkButton = document.querySelector('.modal-warning-ok');
const emptyBoard = document.querySelector('.empty-board');

let todos = [];
let editingTodoId = null;
let countdownInterval = null;
let countdown = 5;
let deletingTodo = null;
let isEditing = false;
let openedByToggle = false;

// MODAL MAIN
modal.style.cssText = `
    display: block;
    visibility: hidden;
    opacity: 0;
`;

function closeModal() {
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modalInput.value = '';
    editingTodoId = null;

    if (openedByToggle) {
        deleteAllToggle.checked = false;
        openedByToggle = false;
    }
}

function openModal() {
    isEditing = false;
    modalInput.value = '';
    modalInput.dataset.originalText = '';
    modalApply.disabled = false;
    modalInput.focus();
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
}

function openEditModal(todo) {
    isEditing = true;
    modalInput.value = todo.text;
    modalInput.dataset.originalText = todo.text;
    modalApply.disabled = true;
    modalInput.focus();
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    editingTodoId = todo.id;
}

// ADD TODO
function addTodoToDOM(todo) {
    const todoTask = document.createElement('div');
    todoTask.className = `todo-task ${todo.completed ? 'completed' : ''}`;
    todoTask.dataset.id = todo.id;

    const todoLeft = document.createElement('div');
    todoLeft.className = 'todo-left';

    const taskCheckbox = document.createElement('div');
    taskCheckbox.className = 'task-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'custom-checkbox';
    checkbox.id = todo.id;
    checkbox.dataset.id = todo.id;
    checkbox.checked = todo.completed;

    const label = document.createElement('label');
    label.htmlFor = todo.id;

    const taskText = document.createElement('span');
    taskText.className = todo.completed ? 'completed' : '';
    taskText.textContent = todo.text;

    taskCheckbox.appendChild(checkbox);
    taskCheckbox.appendChild(label);
    todoLeft.appendChild(taskCheckbox);
    todoLeft.appendChild(taskText);

    const todoRight = document.createElement('div');
    todoRight.className = 'todo-right';

    const editButton = document.createElement('button');
    editButton.className = 'todo-right-button';
    const editIcon = document.createElement('img');
    editIcon.src = './img/svg/pen.svg';
    editIcon.alt = 'edit';
    editIcon.className = 'img-pen';
    editButton.appendChild(editIcon);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'todo-right-button';
    const deleteIcon = document.createElement('img');
    deleteIcon.src = './img/svg/trash.svg';
    deleteIcon.alt = 'delete';
    deleteIcon.className = 'img-trash';
    deleteIcon.dataset.id = todo.id;
    deleteButton.appendChild(deleteIcon);

    todoRight.appendChild(editButton);
    todoRight.appendChild(deleteButton);

    todoTask.appendChild(todoLeft);
    todoTask.appendChild(todoRight);

    container.appendChild(todoTask);
}

function addTodo(text) {
    if (text.trim() === '' || text.length < 3) return;
    const todo = {
        id: `${Date.now()}`,
        text,
        completed: false
    };
    if (todos.length === 0 && deleteAllToggle.checked === true) {
        deleteAllToggle.checked = false;
    }
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
    addTodoToDOM(todo);
    updateTaskStats();
}

// DELETION MODAL
function showDeleteModal(todo) {
    if (deletingTodo) return;
    deletingTodo = todo;
    countdown = 5;

    modalContent.innerHTML = `
        <p>Вы действительно хотите удалить задачу "${todo.text}"?</p>
        <p class="timer">Удаление через ${countdown} секунд(ы)</p>
        <p></p>
        <button class="confirm-delete modal-apply">Да</button>
        <button class="cancel-delete modal-cancel">Нет</button>
    `;
    warningModal.style.display = "flex";

    countdownInterval = setInterval(() => {
        countdown--;
        document.querySelector('.timer').textContent = `Удаление через ${countdown} секунд(ы)`;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            deleteTodoNow(deletingTodo);
        }
    }, 1000);

    document.querySelector('.confirm-delete').onclick = () => {
        clearInterval(countdownInterval);
        deleteTodoNow(deletingTodo);
    };
    document.querySelector('.cancel-delete').onclick = () => {
        cancelDelete();
    };
}

function deleteTodoNow(todo) {
    todos = todos.filter(t => t.id !== todo.id);

    if (todos.length === 0 && deleteAllToggle.checked === false) {
        deleteAllToggle.checked = true;
    }
    localStorage.setItem("todos", JSON.stringify(todos));
    render();
    updateTaskStats();
    hideDeleteModal();
}

function cancelDelete() {
    clearInterval(countdownInterval);
    deletingTodo = null;
    hideDeleteModal();
}

function hideDeleteModal() {
    warningModal.style.display = "none";
    deletingTodo = null;
}

// STATS
function updateTaskStats() {
    const totalTasksElem = document.querySelector('.total-tasks');
    const activeTasksElem = document.querySelector('.active-tasks');
    const completedTasksElem = document.querySelector('.completed-tasks');
    const taskStatsElem = document.querySelector(".task-stats");

    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    const activeTasks = totalTasks - completedTasks;

    totalTasksElem.textContent = String(totalTasks);
    activeTasksElem.textContent = String(activeTasks);
    completedTasksElem.textContent = String(completedTasks);

    if (totalTasks > 0) {
        taskStatsElem.classList.add("visible");
        emptyBoard.style.display = "none";
        todoInput.disabled = false;
        todoInput.style.cursor = "pointer";
    } else {
        taskStatsElem.classList.remove("visible");
        emptyBoard.style.display = "flex";
        todoInput.disabled = true;
        todoInput.style.cursor = "not-allowed";
    }
}

// RENDERING
function render() {
    container.innerHTML = '';
    todos.forEach(todo => addTodoToDOM(todo));

    const selectedValue = document.querySelector('.todo-select').value;
    filterTasks(selectedValue);
}

// FILTER TASKS
function filterTasks(status) {
    const tasks = container.querySelectorAll(".todo-task");

    tasks.forEach(task => {
        const isCompleted = task.classList.contains("completed");

        if (status === "complete" && !isCompleted) {
            task.style.display = "none";
        } else if (status === "incomplete" && isCompleted) {
            task.style.display = "none";
        } else {
            task.style.display = "flex";
        }
    });
}

// THEME
function loadTheme() {
    const theme = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark-theme", theme === "dark");

    updateThemeButtonIcon(theme);
}

function toggleTheme() {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    const theme = isDarkTheme ? "dark" : "light";
    localStorage.setItem("theme", theme);

    updateThemeButtonIcon(theme);
}

function updateThemeButtonIcon(theme) {
    if (theme === "dark") {
        themeButton.querySelector("img").src = "./img/svg/sun.svg";
        themeButton.querySelector("img").alt = "Switch to light theme";
    } else {
        themeButton.querySelector("img").src = "./img/svg/moon.svg";
        themeButton.querySelector("img").alt = "Switch to dark theme";
    }
}

// WARNING MODAL
function showWarningModal() {
    warningModal.style.display = 'flex';
    warningOkButton.focus();
}

function hideWarningModal() {
    warningModal.style.display = 'none';
}

// SEARCH INPUT
function searchTodo() {
    const query = todoInput.value.toLowerCase().trim();
    const tasks = document.querySelectorAll('.todo-task');

    tasks.forEach(task => {
        const taskText = task.querySelector('.todo-left span').textContent.toLowerCase();
        if (taskText.includes(query)) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }

        todoInput.value = '';}
    );
}

// CLOCK
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();

// ATTACH EVENTS
function attachEvents() {
    todoAdd.addEventListener('click', openModal);

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    modalCancel.addEventListener('click', closeModal);

    modalApply.addEventListener('click', () => {
        const currentText = modalInput.value.trim();

        if (isEditing && editingTodoId) {
            const todo = todos.find(t => t.id === editingTodoId);
            if (todo && currentText !== todo.text) {
                todo.text = currentText;
                localStorage.setItem("todos", JSON.stringify(todos));
                render();
                updateTaskStats();
            }
            closeModal();
        } else if (!isEditing) {
            addTodo(currentText);
            closeModal();
        }
    });

    modalInput.addEventListener('input', () => {
        const currentText = modalInput.value.trim();

        if (isEditing) {
            const originalText = modalInput.dataset.originalText || '';
            modalApply.disabled = currentText === originalText || currentText.length < 3;
        } else {
            modalApply.disabled = currentText.length < 3;
        }
    });

    modalInput.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const text = modalInput.value.trim();

            if (text.length < 3) {
                showWarningModal();
            } else {
                if (isEditing && editingTodoId) {
                    const todo = todos.find(t => t.id === editingTodoId);
                    if (todo) {
                        todo.text = text;
                        localStorage.setItem("todos", JSON.stringify(todos));
                        render();
                    }
                    closeModal();
                } else {
                    addTodo(text);
                    render();
                    closeModal();
                }
            }
        }
    });

    container.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('img-trash')) {
            const todoId = target.dataset.id;
            const todo = todos.find(t => t.id === todoId);
            if (todo) showDeleteModal(todo);

        } else if (target.classList.contains('custom-checkbox')) {
            const todoId = target.dataset.id;
            const todo = todos.find(t => t.id === todoId);
            if (todo) {
                todo.completed = target.checked;
                localStorage.setItem("todos", JSON.stringify(todos));
                updateTaskStats();
                const taskElement = target.closest('.todo-task');
                taskElement.classList.toggle('completed', todo.completed);
            }
        } else if (target.classList.contains('img-pen')) {
            const todoId = target.closest('.todo-task').dataset.id;
            const todo = todos.find(t => t.id === todoId);
            if (todo) openEditModal(todo);
        }
    });

    deleteAllToggle.addEventListener('change', () => {
        if (todos.length === 0) {
            openedByToggle = true;
            openModal();
        } else {
            showDeleteAllModal();
        }
    });

    function showDeleteAllModal() {
        const deleteAllModal = document.querySelector('.delete-all-modal');

        deleteAllModal.style.display = "flex";

        document.querySelector('.delete-all-confirm').onclick = () => {
            todos = [];
            localStorage.setItem("todos", JSON.stringify(todos));
            render();
            updateTaskStats();
            deleteAllToggle.checked = false;
            hideDeleteAllModal();
        };

        document.querySelector('.delete-all-cancel').onclick = () => {
            deleteAllToggle.checked = false;
            hideDeleteAllModal();
        };
    }

    function hideDeleteAllModal() {
        const deleteAllModal = document.querySelector('.delete-all-modal');
        deleteAllModal.style.display = "none";
    }

    document.querySelector('.todo-select').addEventListener("change", () => {
        const selectedValue = document.querySelector('.todo-select').value;
        filterTasks(selectedValue);
    });

    todoSearch.addEventListener('click', searchTodo);

    warningOkButton.addEventListener('click', hideWarningModal);

    window.addEventListener("load", loadTheme);
    themeButton.addEventListener("click", toggleTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
    render();
    updateTaskStats();
    attachEvents();
});