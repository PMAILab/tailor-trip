# Task: Create Destination Detail Page & Trip Snapshot

**Feature Area:** Optimization Dashboard
**Status:** Todo
**Priority:** Critical

## Description
Create the main `DestinationDetail` page that serves as the Optimization Dashboard. This page is shown when a user taps a Smart Destination Card and provides a comprehensive, data-rich view to help them make an optimized travel decision. The top section should display a **Trip Snapshot** with the total estimated cost and duration assumption.

## Page Structure
- **Hero Section:** Large destination image with name, region, and a back-navigation button.
- **Trip Snapshot Card:** Prominent card showing total estimated cost (e.g., "₹8,000 – ₹12,000") and duration assumption (e.g., "2–3 days").
- **Tabbed/Scrollable Sections:** Sections for Cost Breakdown, Timing Insights, Trade-Off Toggle, and Budget Fit Meter below the snapshot.
- **Sticky Footer CTA Bar:** Action buttons (Save, Compare later, View booking options).

## Acceptance Criteria
- [ ] Create a `DestinationDetail` page in `src/pages/`.
- [ ] Set up routing so tapping a `DestinationCard` navigates to this page with the destination data.
- [ ] Display a hero section with the destination image, name, and back button.
- [ ] Show a Trip Snapshot card with total estimated cost and duration assumption.
- [ ] Scaffold placeholder sections for Cost Breakdown, Timing Insights, Trade-Off Toggle, and Budget Fit Meter.
- [ ] Ensure the page is responsive and uses the existing design system.
- [ ] Add smooth page-enter transitions/animations.
