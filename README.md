# Task Card UI – HNG Stage 0

A clean, interactive, high-fidelity Task Card built as part of an HNG frontend task.  
The component simulates a modern productivity app card with dynamic time tracking, status updates, and interactive controls.

## Features

- Interactive task completion checkbox
- Live time remaining updates (auto-refresh every 30 seconds)
- Priority-based styling system
- Status updates (In Progress / Completed / Overdue)
- Semantic and accessible HTML structure
- Fully testable via required `data-testid` attributes
- Tag system for categorization
- Edit and delete action buttons (UI-level)

## How to Run Locally

### 1. Clone the repository
git clone https://github.com/Samaro1/hngfe01/

### 2. Navigate into the folder
cd hngfe01

### 3. Open in browser
Simply open index.html:
Double click index.html
OR use Live Server (VS Code extension)

## Decisions Made
### 1. Semantic HTML first

Used:

<article> for card container
<header> for task header
<section> for grouped metadata
<time> for all date-related values

This improves accessibility and aligns with best practices.

### 2. Data-testid driven architecture

All key elements are mapped to required test IDs to ensure:

Automated test compatibility
Stable DOM targeting
Separation of styling vs testing logic

### 3. Time handling strategy
JavaScript Date API used for all time calculations
Time remaining updates every 30 seconds
Relative formatting used:
“Due in X min / hrs / days”
“Overdue by X hrs”

### 4. Status logic
Status is derived from:
Checkbox state → Completed / In Progress
Time comparison → Overdue detection
Combined logic ensures real-time feedback

## TradeOffs
### 1. No framework (React/Vue)
Task requires vanilla implementation
Keeps bundle size zero
Easier evaluation for HNG graders

Trade-off:
Less scalable for large apps

### 2. Minimal state management
Single component scope
No Redux/Zustand overhead needed

Trade-off:
Not suitable for multi-card systems without refacto
