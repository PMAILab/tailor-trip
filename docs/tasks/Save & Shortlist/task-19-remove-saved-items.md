# Task: Implement Remove / Manage Saved Items

**Feature Area:** Save & Shortlist
**Status:** Todo
**Priority:** Medium

## Description
Allow users to manage their shortlist by removing saved destinations. Unsaving a destination (via the heart icon toggle) should remove it from the Shortlist page, ideally with a smooth exit animation. Optionally, provide an undo/toast notification to prevent accidental removals.

## Acceptance Criteria
- [ ] Tapping the save icon on a saved card removes it from the shortlist.
- [ ] Card removal is reflected immediately in the Shortlist page grid.
- [ ] Smooth exit animation when a card is removed (e.g., fade-out or slide-out).
- [ ] Show an undo toast/snackbar after removal (e.g., "Removed Goa — Undo") with a brief auto-dismiss timer.
- [ ] If all items are removed, transition gracefully to the empty state.
- [ ] Persist the updated list in `localStorage` after removal.
