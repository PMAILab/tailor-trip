# Task: Build Budget Fit Meter

**Feature Area:** Optimization Dashboard
**Status:** Todo
**Priority:** Medium

## Description
Implement an optional **Budget Fit Meter** that allows the user to input their monthly salary and instantly see how affordable the trip is relative to their income. This provides a quick affordability signal without requiring login or account creation.

## Interaction Flow
1. User sees a collapsed "Check affordability" prompt.
2. Tapping it reveals a salary input field (numeric, formatted in ₹).
3. On input, a visual meter/gauge shows the trip cost as a percentage of monthly income (e.g., "This trip is approx 18% of your monthly income").
4. Color-coded feedback: green (< 20%), amber (20–40%), red (> 40%).

## Acceptance Criteria
- [ ] Create a `BudgetFitMeter` component in `src/components/`.
- [ ] Render a collapsible section with a "Check affordability" prompt.
- [ ] On expand, show a salary input with proper ₹ formatting and numeric validation.
- [ ] Calculate and display trip cost as a percentage of salary.
- [ ] Show a visual gauge/progress bar with color-coded affordability feedback.
- [ ] Persist the salary input in `localStorage` so the user doesn't have to re-enter it.
- [ ] Ensure the input is optional and the section is clearly marked as such.
- [ ] Responsive and accessible design.
