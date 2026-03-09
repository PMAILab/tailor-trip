# Task: Implement Action CTA Bar

**Feature Area:** Optimization Dashboard
**Status:** Todo
**Priority:** High

## Description
Build a **sticky footer CTA bar** on the Optimization Dashboard with three key actions: **Save**, **Compare Later**, and **View Booking Options**. These are the primary conversion points that move the user from research to action.

## Action Items
- **Save:** Saves the destination to the user's shortlist (integrates with existing Save & Shortlist feature via `MoodContext` / `localStorage`).
- **Compare Later:** Adds the destination to a comparison queue (can reuse the save mechanism with a "compare" tag for MVP).
- **View Booking Options:** Redirects to an external OTA link (prepares for the Outbound Booking feature).

## Acceptance Criteria
- [ ] Create a `ActionCTABar` component in `src/components/`.
- [ ] Render a sticky bottom bar with Save, Compare Later, and View Booking Options buttons.
- [ ] Save button toggles state (Save ↔ Saved) and persists via `localStorage`.
- [ ] Compare Later button adds the destination to a comparison list in `localStorage`.
- [ ] View Booking Options button opens an external link (placeholder URL for MVP).
- [ ] Visual feedback on button press (ripple, icon animation, or color change).
- [ ] Bar should be fixed at the bottom and not overlap page content (add bottom padding to page).
- [ ] Responsive design with icon-only mode on very small screens.
