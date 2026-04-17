const elements = {
  card: document.querySelector('[data-testid="test-todo-card"]'),
  view: document.querySelector('[data-testid="test-todo-view"]'),

  title: document.querySelector('[data-testid="test-todo-title"]'),
  desc: document.querySelector('[data-testid="test-todo-description"]'),
  priority: document.querySelector('[data-testid="test-todo-priority"]'),
  priorityIndicator: document.querySelector('[data-testid="test-todo-priority-indicator"]'),
  status: document.querySelector('[data-testid="test-todo-status"]'),

  checkbox: document.querySelector('[data-testid="test-todo-complete-toggle"]'),

  editForm: document.querySelector('[data-testid="test-todo-edit-form"]'),
  editBtn: document.querySelector('[data-testid="test-todo-edit-button"]'),
  saveBtn: document.querySelector('[data-testid="test-todo-save-button"]'),
  cancelBtn: document.querySelector('[data-testid="test-todo-cancel-button"]'),

  statusControl: document.querySelector('[data-testid="test-todo-status-control"]'),
  timeRemaining: document.querySelector('[data-testid="test-todo-time-remaining"]'),
  overdueIndicator: document.querySelector('[data-testid="test-todo-overdue-indicator"]'),

  expandBtn: document.querySelector('[data-testid="test-todo-expand-toggle"]'),
  collapsibleSection: document.querySelector('[data-testid="test-todo-collapsible-section"]'),

  editTitleInput: document.querySelector('[data-testid="test-todo-edit-title-input"]'),
  editDescriptionInput: document.querySelector('[data-testid="test-todo-edit-description-input"]'),
  editPrioritySelect: document.querySelector('[data-testid="test-todo-edit-priority-select"]'),
  editDueDateInput: document.querySelector('[data-testid="test-todo-edit-due-date-input"]'),

  dueDateDisplay: document.querySelector('[data-testid="test-todo-due-date"]')
};

const DESCRIPTION_COLLAPSE_THRESHOLD = 120;
const TIME_UPDATE_INTERVAL = 30000;

let timeIntervalId = null;

const state = {
  title: "Build Interactive Todo Card UI",
  description: "Design and implement a clean interactive task card. ",
  priority: "high",
  status: "in-progress",
  dueDate: "2026-04-15T23:59:59",
  expanded: false,
  editing: false
};

function formatStatusLabel(status) {
  if (status === "in-progress") return "In Progress";
  if (status === "pending") return "Pending";
  if (status === "done") return "Done";
  return "In Progress";
}

function formatPriorityLabel(priority) {
  if (!priority) return "";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function toLocalInputValue(dateValue) {
  const date = new Date(dateValue);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
}

function normalizeInputDate(value) {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
}

function formatDueDateLabel(dateValue) {
  const date = new Date(dateValue);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return `Due ${date.toLocaleDateString(undefined, options)}`;
}

function pluralize(value, unit) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function formatRelativeTime(diffMs) {
  const abs = Math.abs(diffMs);
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (abs < minute) {
    return diffMs <= 0 ? "Overdue by less than 1 min" : "Due in less than 1 min";
  }

  if (abs < hour) {
    const minutes = Math.floor(abs / minute);
    return diffMs <= 0
      ? `Overdue by ${pluralize(minutes, "minute")}`
      : `Due in ${pluralize(minutes, "minute")}`;
  }

  if (abs < day) {
    const hours = Math.floor(abs / hour);
    return diffMs <= 0
      ? `Overdue by ${pluralize(hours, "hour")}`
      : `Due in ${pluralize(hours, "hour")}`;
  }

  const days = Math.floor(abs / day);
  return diffMs <= 0
    ? `Overdue by ${pluralize(days, "day")}`
    : `Due in ${pluralize(days, "day")}`;
}

function syncPriorityUI() {
  elements.priority.className = `priority priority-${state.priority}`;
  elements.priority.textContent = formatPriorityLabel(state.priority);

  if (elements.priorityIndicator) {
    elements.priorityIndicator.className = `priority-dot priority-${state.priority}`;
  }
}

function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'input, textarea, select, button'
  );

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // SHIFT + TAB
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // TAB forward
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

function syncStatusUI() {
  elements.status.className = `status ${state.status}`;
  elements.status.textContent = formatStatusLabel(state.status);

  elements.statusControl.value = state.status;
  elements.checkbox.checked = state.status === "done";

  elements.card.classList.toggle("status-completed", state.status === "done");
}

function syncDueDateUI() {
  elements.dueDateDisplay.textContent = formatDueDateLabel(state.dueDate);
  elements.editDueDateInput.value = toLocalInputValue(state.dueDate);
}

function syncExpandUI() {
  const shouldCollapse = !state.expanded;

  elements.collapsibleSection.classList.toggle("collapsed", shouldCollapse);
  elements.expandBtn.textContent = shouldCollapse ? "Expand" : "Collapse";
}

function updateTimeRemaining() {
  if (state.status === "done") {
    elements.timeRemaining.textContent = "Completed";
    elements.timeRemaining.classList.remove("time-urgent", "time-warning");
    elements.overdueIndicator.classList.add("hidden");
    return;
  }

  const diff = new Date(state.dueDate) - new Date();

  elements.timeRemaining.classList.remove("time-urgent", "time-warning");

  if (diff <= 0) {
    elements.timeRemaining.textContent = formatRelativeTime(diff);
    elements.timeRemaining.classList.add("time-urgent");
    elements.overdueIndicator.classList.remove("hidden");
  } else {
    elements.timeRemaining.textContent = formatRelativeTime(diff);
    elements.overdueIndicator.classList.add("hidden");

    if (diff < 1000 * 60 * 60 * 24) {
      elements.timeRemaining.classList.add("time-warning");
    }
  }
}

function stopTimeUpdates() {
  if (timeIntervalId !== null) {
    clearInterval(timeIntervalId);
    timeIntervalId = null;
  }
}

function startTimeUpdates() {
  if (timeIntervalId !== null || state.status === "done") return;
  timeIntervalId = setInterval(updateTimeRemaining, TIME_UPDATE_INTERVAL);
}

function syncTimeEngine() {
  if (state.status === "done") {
    stopTimeUpdates();
    updateTimeRemaining();
    return;
  }

  updateTimeRemaining();

  if (timeIntervalId === null) {
    startTimeUpdates();
  }
}

function render() {
  elements.title.textContent = state.title;
  elements.desc.textContent = state.description;

  syncPriorityUI();
  syncStatusUI();
  syncDueDateUI();
  syncExpandUI();
  syncTimeEngine();
}

function populateEditFields() {
  elements.editTitleInput.value = state.title;
  elements.editDescriptionInput.value = state.description;
  elements.editPrioritySelect.value = state.priority;
  elements.editDueDateInput.value = toLocalInputValue(state.dueDate);
}

function enterEditMode() {
  populateEditFields();
  state.editing = true;

  elements.view.classList.add("hidden");
  elements.editForm.classList.remove("hidden");
  trapFocus(elements.editForm);
  requestAnimationFrame(() => {
    elements.editTitleInput.focus();
  });
}

function exitEditMode() {
  state.editing = false;

  elements.editForm.classList.add("hidden");
  elements.view.classList.remove("hidden");

  requestAnimationFrame(() => {
    elements.editBtn.focus();
  });
}

function saveEdit() {
  const nextTitle = elements.editTitleInput.value.trim();
  const nextDescription = elements.editDescriptionInput.value.trim();
  const nextPriority = elements.editPrioritySelect.value;
  const nextDueDate = normalizeInputDate(elements.editDueDateInput.value);

  if (nextTitle) state.title = nextTitle;
  if (nextDescription) state.description = nextDescription;
  if (nextPriority) state.priority = nextPriority;
  if (nextDueDate) state.dueDate = nextDueDate;

  state.expanded = state.description.length <= DESCRIPTION_COLLAPSE_THRESHOLD;

  render();
  exitEditMode();
}

function cancelEdit() {
  populateEditFields();
  exitEditMode();
}

function toggleExpand() {
  state.expanded = !state.expanded;

  elements.collapsibleSection.classList.toggle("collapsed", !state.expanded);
  elements.expandBtn.textContent = state.expanded ? "Collapse" : "Expand";
}

function setStatus(nextStatus) {
  state.status = nextStatus;

  if (nextStatus === "done") {
    elements.checkbox.checked = true;
  } else {
    elements.checkbox.checked = false;
  }

  render();
}

function handleCheckboxChange() {
  if (elements.checkbox.checked) {
    setStatus("done");
  } else {
    setStatus("pending");
  }
}

function handleStatusControlChange(e) {
  const nextStatus = e.target.value;

  if (nextStatus === "done") {
    elements.checkbox.checked = true;
  } else {
    elements.checkbox.checked = false;
  }

  setStatus(nextStatus);
}

function init() {
  state.expanded = state.description.length <= DESCRIPTION_COLLAPSE_THRESHOLD;

  elements.editBtn.addEventListener("click", enterEditMode);
  elements.saveBtn.addEventListener("click", saveEdit);
  elements.cancelBtn.addEventListener("click", cancelEdit);
  elements.expandBtn.addEventListener("click", toggleExpand);

  elements.statusControl.addEventListener("change", handleStatusControlChange);
  elements.checkbox.addEventListener("change", handleCheckboxChange);

  render();
}

init();