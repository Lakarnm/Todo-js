"use strict";

// VARIABLES
const todoAdd = document.querySelector('.todo_add_button');
const todoInput = document.querySelector('.todo_input');
const todoSearch = document.querySelector('.todo_search');
const container = document.querySelector('.todo_container');
const modal = document.querySelector('.modal');
const modalCover = document.querySelector('.modal_cover');
const modalInput = document.querySelector('.modal_input');
const modalCancel = document.querySelector('.modal_cancel');
const modalApply = document.querySelector('.modal_apply');
const saveButton = document.querySelector('.modal_save');
const themeButton = document.querySelector('.todo_theme_button');
const deleteAllToggle = document.getElementById('deleteAllToggle');
const clockElement = document.querySelector('.clock');
const warningModal = document.querySelector('.modal_warning');
const modalContent = document.querySelector('.modal_warning_content');
const warningOkButton = document.querySelector('.modal_warning_ok');
const emptyBoard = document.querySelector('.empty_board');

let todos = [];
let editingTodoId = null;
let countdownInterval = null;
let countdown = 5;
let deletingTodo = null;


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
}

function openModal() {
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modalApply.focus();
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
        <p id="timer">Удаление через ${countdown} секунд(ы)</p>
        <p></p>
        <button id="confirmDelete">Да</button>
        <button id="cancelDelete">Нет</button>
    `;
    warningModal.style.display = "flex";

    countdownInterval = setInterval(() => {
        countdown--;
        document.getElementById("timer").textContent = `Удаление через ${countdown} секунд(ы)`;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            deleteTodoImmediate(deletingTodo);
        }
    }, 1000);

    document.getElementById("confirmDelete").onclick = () => {
        clearInterval(countdownInterval);
        deleteTodoImmediate(deletingTodo);
    };
    document.getElementById("cancelDelete").onclick = () => {
        cancelDelete();
    };
}


function deleteTodoImmediate(todo) {
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
    const totalTasksElem = document.getElementById("total_tasks");
    const activeTasksElem = document.getElementById("active_tasks");
    const completedTasksElem = document.getElementById("completed_tasks");
    const taskStatsElem = document.querySelector(".task_stats");

    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    const activeTasks = totalTasks - completedTasks;

    totalTasksElem.textContent = totalTasks;
    activeTasksElem.textContent = activeTasks;
    completedTasksElem.textContent = completedTasks;

    if (totalTasks > 0) {
        taskStatsElem.classList.add("visible");
        emptyBoard.style.display = "none";
    } else {
        taskStatsElem.classList.remove("visible");
        emptyBoard.style.display = "flex";
    }
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

window.addEventListener("load", loadTheme);
themeButton.addEventListener("click", toggleTheme);


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
        event.preventDefault();
        // event.stopPropagation();
        const text = modalInput.value.trim();

        if (text.length < 3) {
            // event.preventDefault();
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
        const todo = todos.find(t => t.id === todoId);
        if (todo) showDeleteModal(todo);

    } else if (target.classList.contains('custom_checkbox')) {
        const todoId = target.dataset.id;
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = target.checked;
            localStorage.setItem("todos", JSON.stringify(todos));
            updateTaskStats();
            const taskElement = target.closest('.todo_task');
            taskElement.classList.toggle('completed', todo.completed);
        }

    } else if (target.classList.contains('img_pen')) {
        const todoId = target.closest('.todo_task').dataset.id;
        const todo = todos.find(t => t.id === todoId);
        if (todo) openEditModal(todo);
    }
});


//DELETE ALL
deleteAllToggle.addEventListener('change', () => {
    if (todos.length === 0) {
        openModal();
    } else {
        const confirmation = confirm("Вы действительно хотите удалить все задачи?");
        if (confirmation) {
            todos = [];
            localStorage.setItem("todos", JSON.stringify(todos));
            render();
            updateTaskStats();
        } else {
            deleteAllToggle.checked = false;
        }
    }
});


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


// FILTER
document.getElementById("task_status").addEventListener("change", () => {
    const selectedValue = document.getElementById("task_status").value;
    filterTasks(selectedValue);
});


// WARNING
function showWarningModal() {
    warningModal.style.display = 'flex';
    warningOkButton.focus();
}

function hideWarningModal() {
    warningModal.style.display = 'none';
}

warningOkButton.addEventListener('click', hideWarningModal);


// SEARCH
function searchTodo() {
    const query = todoInput.value.toLowerCase().trim();
    const tasks = document.querySelectorAll('.todo_task');

    tasks.forEach(task => {
        const taskText = task.querySelector('.todo_left span').textContent.toLowerCase();
        if (taskText.includes(query)) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }

        todoInput.value = '';}
    );
}

todoSearch.addEventListener('click', searchTodo);


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

