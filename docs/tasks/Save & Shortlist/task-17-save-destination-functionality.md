# Task: Implement Save Destination Functionality

**Feature Area:** Save & Shortlist
**Status:** Done
**Priority:** High

## Description
Implement the core save/unsave mechanism that allows users to bookmark destinations to their personal shortlist. This is the foundational piece of the Save & Shortlist feature — tapping a heart icon on any Destination Card should toggle its saved state, persisting across sessions via `localStorage`.

## Acceptance Criteria
- [ ] Expose `toggleSaveDestination` and `savedDestinationIds` from `MoodContext`.
- [ ] Persist saved destination IDs in `localStorage` so they survive page refreshes.
- [ ] Heart/save icon on `DestinationCard` toggles between saved and unsaved states.
- [ ] Visual feedback on toggle (filled heart when saved, outline when unsaved).
- [ ] Ensure save state is consistent across Explore, Shortlist, and TripDetails pages.
