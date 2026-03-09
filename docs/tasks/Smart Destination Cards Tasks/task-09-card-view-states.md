# Task: Implement Card View States

**Feature Area:** Smart Destination Cards
**Status:** Todo
**Priority:** Medium

## Description
Support three distinct view states for each `DestinationCard` — **Default**, **Expanded**, and **Saved** — so users can interact with cards progressively without leaving the recommendations list.

## View States
1. **Default:** Compact card showing hero image, name, cost range, badges, and the collapsed "Why this fits you" toggle.
2. **Expanded:** Full card with the "Why this fits you" section open, additional details visible, and action buttons (Save, View Details).
3. **Saved:** Visual indicator (filled heart icon, border highlight, or subtle background change) showing the card has been shortlisted.

## Acceptance Criteria
- [ ] Implement a Default → Expanded toggle on card tap or click.
- [ ] Show a "Save" button/icon that toggles the Saved state.
- [ ] Apply distinct visual styling for saved cards (e.g., filled heart, accent border).
- [ ] Persist saved state locally (localStorage or app state) so it survives page navigations.
- [ ] Ensure smooth transitions between all three states.
- [ ] Add a "View Details" CTA in the expanded state that navigates to `/trip/:id`.
