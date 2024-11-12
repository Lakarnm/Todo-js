"use strict";

// VARIABLES
let todos = [];
const todoAdd = document.querySelector('.todo_add_button');
const todoInput = document.querySelector('.todo_input');
const container = document.querySelector('.todo_container');
const modal = document.querySelector('.modal');
const modalCover = document.querySelector('.modal_cover');
const modalInput = document.querySelector('.modal_input');
const modalCancel = document.querySelector('.modal_cancel');
const modalApply = document.querySelector('.modal_apply');
const saveButton = document.querySelector('.modal_save');
const undoContainer = document.getElementById("undoContainer");
const undoButton = document.getElementById("undoButton");
const themeButton = document.querySelector('.todo_theme_button');
const deleteAllToggle = document.getElementById('deleteAllToggle');
const warningModal = document.querySelector('.modal_warning');
const warningOkButton = document.querySelector('.modal_warning_ok');


let editingTodoId = null;
let lastDeletedTask = null;
let undoTimer;

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
}

function openModal() {
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
}


function openEditModal(todo) {
    modalInput.value = todo.text;
    openModal();
    editingTodoId = todo.id;
    saveButton.disabled = true;
}


function addTodoToDOM(todo) {
    const completedClass = todo.completed ? 'completed' : '';
    const html = `
        <div class="todo_task ${completedClass}" data-id="${todo.id}">
            <div class="todo_left">
                <div class="task_checkbox">
                    <input data-id="${todo.id}" class="custom_checkbox" id="${todo.id}" type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <label for="${todo.id}"></label>
                </div>
                <span class="${completedClass}">${todo.text}</span>
            </div>
            <div class="todo_right">
                <button class="todo_right_button">
                    <img class="img_pen" src="./img/svg/pen.svg" alt="edit">
                </button>
                <button class="todo_right_button">
                    <img data-id="${todo.id}" class="img_trash" src="./img/svg/trash.svg" alt="delete">
                </button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

function addTodo(text) {
    if (text.trim() === '' || text.length < 3) return;
    const todo = {
        id: `${Date.now()}`,
        text,
        completed: false
    };
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
    addTodoToDOM(todo);
    updateTaskStats();
}

function deleteTodo(id) {
    lastDeletedTask = todos.find(todo => todo.id === id);
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem("todos", JSON.stringify(todos));
    render();
    updateTaskStats();
    showUndoButton();
}

function undoDelete() {
    if (!lastDeletedTask) return;
    todos.push(lastDeletedTask);
    localStorage.setItem("todos", JSON.stringify(todos));
    render();
    updateTaskStats();
    hideUndoButton();
}

function showUndoButton() {
    undoContainer.classList.remove("hidden");
    let counter = 5;
    document.getElementById("undoCounter").innerText = counter;

    undoTimer = setInterval(() => {
        counter--;
        document.getElementById("undoCounter").innerText = counter;
        if (counter <= 0) hideUndoButton();
    }, 1000);
}

function hideUndoButton() {
    undoContainer.classList.add("hidden");
    clearInterval(undoTimer);
    lastDeletedTask = null;
}

// STATS
function updateTaskStats() {
    const totalTasksElem = document.getElementById("total-tasks");
    const activeTasksElem = document.getElementById("active-tasks");
    const completedTasksElem = document.getElementById("completed-tasks");

    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    const activeTasks = totalTasks - completedTasks;

    totalTasksElem.textContent = totalTasks;
    activeTasksElem.textContent = activeTasks;
    completedTasksElem.textContent = completedTasks;
}

// RENDERING
function render() {
    container.innerHTML = '';
    todos.forEach(todo => addTodoToDOM(todo));

    const selectedValue = document.getElementById("task_status").value;
    filterTasks(selectedValue);
}

window.onload = () => {
    todos = JSON.parse(localStorage.getItem("todos")) || [];
    render();
    updateTaskStats();
};

// FILTER TASKS
function filterTasks(status) {
    const tasks = container.querySelectorAll(".todo_task");

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
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    localStorage.setItem("theme", theme);
}

window.addEventListener('load', loadTheme);

themeButton.addEventListener('click', toggleTheme);



// EVENT LISTENERS
todoAdd.addEventListener('click', openModal);

modalCover.addEventListener('click', (event) => {
    if (event.target === modalCover) {
        closeModal();
    }
});


modalCancel.addEventListener('click', closeModal);

modalApply.addEventListener('click', () => {
    const text = modalInput.value.trim();
    if (text.length < 3) {
        showWarningModal();
    } else {
        addTodo(text);
        render();
        closeModal();
    }
});

modalInput.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        const text = modalInput.value.trim();
        if (text.length < 3) {
            showWarningModal();
        } else {
            addTodo(text);
            render();
            closeModal();
        }
    }
});

container.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('img_trash')) {
        const todoId = target.dataset.id;
        deleteTodo(todoId);
    } else if (target.classList.contains('custom_checkbox')) {
        const todoId = target.dataset.id;
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = target.checked;
            localStorage.setItem("todos", JSON.stringify(todos));
            updateTaskStats();
            const taskElement = target.closest('.todo_task');
            if (todo.completed) {
                taskElement.classList.add('completed');
            } else {
                taskElement.classList.remove('completed');
            }
        }
    } else if (target.classList.contains('img_pen')) {
        const todoId = target.closest('.todo_task').dataset.id;
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            openModal();
            modalInput.value = todo.text;
            editingTodoId = todoId;
        }
    }
});

undoButton.addEventListener("click", undoDelete);


// SAVE BUTTON
modalInput.addEventListener('input', () => {
    const newText = modalInput.value.trim();
    saveButton.disabled = newText.length < 3 || newText === todos.find(todo => todo.id === editingTodoId)?.text;
});

saveButton.addEventListener('click', () => {
    const newText = modalInput.value.trim();
    if (newText.length >= 3 && editingTodoId) {
        const todo = todos.find(todo => todo.id === editingTodoId);
        if (todo) {
            todo.text = newText;

            localStorage.setItem("todos", JSON.stringify(todos));

            render();
            closeModal();
            editingTodoId = null;
        }
    }
});

container.addEventListener('click', (event) => {
    if (event.target.classList.contains('img_pen')) {
        const todoId = event.target.closest('.todo_task').querySelector('.custom_checkbox').dataset.id;
        const todo = todos.find(t => t.id === todoId);
        if (todo) openEditModal(todo);
    }
});



// FILTER
document.getElementById("task_status").addEventListener("change", () => {
    const selectedValue = document.getElementById("task_status").value;
    filterTasks(selectedValue);
});


// WARNING
function showWarningModal() {
    warningModal.style.display = 'flex';
    document.addEventListener('keydown', closeWarningOnEnter);
}

function hideWarningModal() {
    warningModal.style.display = 'none';
    document.removeEventListener('keydown', closeWarningOnEnter);
}

function closeWarningOnEnter(event) {
    if (event.key === "Enter") {
        hideWarningModal();
    }
}

warningOkButton.addEventListener('click', hideWarningModal);


// CLOCK
const clockElement = document.querySelector('.clock');

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);
updateClock();
