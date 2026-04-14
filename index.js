// ELEMENT SELECTION
const elements = {
  card: document.querySelector('[data-testid="test-todo-card"]'),
  title: document.querySelector('[data-testid="test-todo-title"]'),
  description: document.querySelector('[data-testid="test-todo-description"]'),
  priority: document.querySelector('[data-testid="test-todo-priority"]'),
  status: document.querySelector('[data-testid="test-todo-status"]'),
  time: document.querySelector('[data-testid="test-todo-time-remaining"]'),
  dueDate: document.querySelector('[data-testid="test-todo-due-date"]'),
  checkbox: document.querySelector('[data-testid="test-todo-complete-toggle"]')
};

// CONFIG
const config = {
  dueDate: "2026-04-15T23:59:59",
  priority: "high"
};


// PRIORITY HANDLER
function updatePriority(level) {
  const el = elements.priority;

  el.classList.remove('priority-low', 'priority-medium', 'priority-high');
  el.classList.add(`priority-${level}`);

  el.textContent = level.charAt(0).toUpperCase() + level.slice(1);
}

// TIME CALCULATION
function formatTimeRemaining(diff) {
  const abs = Math.abs(diff);

  const minutes = Math.floor(abs / (1000 * 60));
  const hours = Math.floor(abs / (1000 * 60 * 60));
  const days = Math.floor(abs / (1000 * 60 * 60 * 24));

  if (diff <= 0) {
    if (minutes < 60) return `Overdue by ${minutes} min`;
    if (hours < 24) return `Overdue by ${hours} hr${hours > 1 ? 's' : ''}`;
    return `Overdue by ${days} day${days > 1 ? 's' : ''}`;
  }

  if (minutes < 60) return `Due in ${minutes} min`;
  if (hours < 24) return `Due in ${hours} hr${hours > 1 ? 's' : ''}`;
  if (days === 1) return "Due Tomorrow";

  return `Due in ${days} days`;
}

// TIME REMAINING HANDLER
function updateTimeRemaining() {
  const now = new Date();
  const due = new Date(config.dueDate);
  const diff = due - now;

  const timeEl = elements.time;

  timeEl.classList.remove('time-urgent', 'time-warning');

  if (diff <= 0) {
    timeEl.classList.add('time-urgent');
    if (!elements.checkbox.checked) {
      elements.status.textContent = "Overdue";
    }
  } else if (diff < 1000 * 60 * 60 * 24) {
    timeEl.classList.add('time-warning');
    if (!elements.checkbox.checked) {
      elements.status.textContent = "In Progress";
    }
  }

  timeEl.textContent = formatTimeRemaining(diff);
}

// DUE DATE FORMATTER
function formatDueDate() {
  const due = new Date(config.dueDate);

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  elements.dueDate.textContent = `Due ${due.toLocaleDateString(undefined, options)}`;
}

// COMPLETION HANDLER
function handleCompletion() {
  elements.checkbox.addEventListener('change', () => {
    const isChecked = elements.checkbox.checked;

    elements.card.classList.toggle('status-completed', isChecked);
    elements.status.textContent = isChecked ? "Completed" : "In Progress";
  });
}

// INITIALIZATION
function init() {
  updatePriority(config.priority);
  formatDueDate();
  updateTimeRemaining();
  handleCompletion();

  setInterval(updateTimeRemaining, 30000);
}

init();