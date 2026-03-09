# Task: Build Saved Tab / Shortlist Page

**Feature Area:** Save & Shortlist
**Status:** Done
**Priority:** High

## Description
Create a dedicated **Shortlist** page (accessible via a tab or navigation link) where users can view all their saved/bookmarked destinations in one place. This page should pull saved IDs from state/`localStorage` and render the corresponding `DestinationCard` components.

## Acceptance Criteria
- [ ] Create the `Shortlist` page at `src/pages/Shortlist.tsx` (route: `/shortlist`).
- [ ] Display all saved destinations as `DestinationCard` components in a responsive grid.
- [ ] Show saved count (e.g., "3 trips saved for your next escape.").
- [ ] Display an empty state with a friendly message and a CTA to explore destinations when nothing is saved.
- [ ] Add the Shortlist link/tab to the main navigation or bottom bar.
- [ ] Ensure cards on this page also support toggling the save state (unsaving removes them from the list).
