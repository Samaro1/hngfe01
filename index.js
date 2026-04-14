// =======================
// ELEMENT SELECTION
// =======================
const elements = {
  card: document.querySelector('[data-testid="test-todo-card"]'),
  title: document.querySelector('[data-testid="test-todo-title"]'),
  todoDescription: document.querySelector('[data-testid="test-todo-description"]'),
  priority: document.querySelector('[data-testid="test-todo-priority"]'),
  status: document.querySelector('[data-testid="test-todo-status"]'),
  time: document.querySelector('[data-testid="test-todo-time-remaining"]'),
  dueDate: document.querySelector('[data-testid="test-todo-due-date"]'),
  checkbox: document.querySelector('[data-testid="test-todo-complete-toggle"]'),
  saveButton: document.querySelector('[data-testid="test-todo-save-button"]'),
  editButton: document.querySelector('[data-testid="test-todo-edit-button"]'),
  editTitle: document.querySelector('.tasktitle'),
  editDescription: document.querySelector('.taskdescription'),
  editDueDate: document.querySelector('.taskduedate'),
  editPriority: document.querySelector('.taskpriority'),
  editTags: document.querySelector('.tasktags'),  
  editPanel: document.querySelector('.editpanel'),
  panelContainer: document.querySelector('.panelhidden'),
  editCloseButton: document.querySelector('.close-btn')
};

// =======================
// CONFIG (EDITABLE DATA)
// =======================
const config = {
  dueDate: "2026-04-13T23:59:59",
  priority: "medium" // "low" | "medium" | "high"
};

// =======================
// PRIORITY HANDLER
// =======================
function updatePriority(level) {
  const el = elements.priority;

  el.classList.remove('priority-low', 'priority-medium', 'priority-high');
  el.classList.add(`priority-${level}`);

  // Optional: update text
  el.textContent = level.charAt(0).toUpperCase() + level.slice(1);
}

// =======================
// TIME CALCULATION
// =======================
function formatTimeRemaining(diff) {
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diff <= 0) {
    return { text: "Overdue", state: "urgent" };
  }

  if (minutes < 60) {
    return { text: `Due in ${minutes} min`, state: "urgent" };
  }

  if (hours < 24) {
    return { text: `Due in ${hours} hr${hours > 1 ? 's' : ''}`, state: "warning" };
  }

  if (days === 1) {
    return { text: "Due Tomorrow", state: "normal" };
  }

  return { text: `Due in ${days} days`, state: "normal" };
}

// =======================
// TIME REMAINING HANDLER
// =======================
function updateTimeRemaining() {
  const now = new Date();
  const due = new Date(config.dueDate);

  const diff = due - now;

  const result = formatTimeRemaining(diff);

  const timeEl = elements.time;

  // reset state classes
  timeEl.classList.remove('time-urgent', 'time-warning');

  // apply new state
  if (result.state === "urgent") {
    timeEl.classList.add('time-urgent');
  } else if (result.state === "warning") {
    timeEl.classList.add('time-warning');
  }

  timeEl.textContent = result.text;
}

// =======================
// DUE DATE FORMATTER
// =======================
function formatDueDate() {
  const due = new Date(config.dueDate);

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const formatted = due.toLocaleDateString(undefined, options);

  elements.dueDate.textContent = formatted;
}

// =======================
// COMPLETION HANDLER
// =======================
function handleCompletion() {
  elements.checkbox.addEventListener('change', () => {
  elements.card.classList.toggle('status-completed', elements.checkbox.checked);

    // update status text
  elements.status.textContent = elements.checkbox.checked ? "Completed" : "In Progress";
  });
}

function handleEdit() {
  elements.editButton.addEventListener('click', () => {

    if (elements.checkbox.checked) return;

    elements.panelContainer.classList.remove('panelhidden');

    elements.editTitle.value = elements.title.textContent;
    elements.editDueDate.value = config.dueDate.split('T')[0];
    elements.editPriority.value = config.priority;
  });
}

  function closeEdit() {
      elements.editCloseButton.addEventListener('click', () => {
    elements.panelContainer.classList.add('panelhidden');
  });
  }

function handleSave() {
  elements.saveButton.addEventListener('click', () => {

    // Get values from inputs
    const newTitle = elements.editTitle.value;
    const newDescription = elements.editDescription ? elements.editDescription.value : "";
    const newDueDate = elements.editDueDate.value;
    const newPriority = elements.editPriority.value;

    // UPDATE config (data layer)
    config.dueDate = newDueDate + "T23:59:59";
    config.priority = newPriority;

    // UPDATE UI directly
    elements.title.textContent = newTitle;
    elements.todoDescription.textContent = newDescription;
    updatePriority(config.priority);
    formatDueDate();
    updateTimeRemaining();

    // CLOSE panel
    elements.panelContainer.classList.add('panelhidden');
  });
}
// =======================
// INITIALIZATION
// =======================
function init() {
  updatePriority(config.priority);
  formatDueDate();
  updateTimeRemaining();
  handleCompletion();
  handleEdit();
  closeEdit();
  handleSave();

  // Update every 30 seconds
  setInterval(updateTimeRemaining, 30000);
}

init();