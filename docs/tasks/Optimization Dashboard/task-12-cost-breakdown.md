# Task: Implement Cost Breakdown Section

**Feature Area:** Optimization Dashboard
**Status:** Todo
**Priority:** High

## Description
Build a detailed **Cost Breakdown** component within the Optimization Dashboard. This section splits the total estimated cost into clear categories so the user understands where their money goes, and provides a per-person estimate.

## Breakdown Categories
- **Travel:** Flights, trains, or fuel costs.
- **Stay:** Hotel or accommodation estimate.
- **Food & Experiences:** Daily food budget + activities/sightseeing.
- **Per-Person Estimate:** Total cost divided by number of travelers (default: 1).

## Acceptance Criteria
- [ ] Create a `CostBreakdown` component in `src/components/`.
- [ ] Display a visual breakdown (e.g., stacked bar, pie chart, or segmented list) of Travel, Stay, and Food & Experiences costs.
- [ ] Show a per-person estimate with an optional traveler count selector.
- [ ] Use color-coded segments for each category.
- [ ] Ensure costs are formatted in INR (₹) with proper locale formatting.
- [ ] Add subtle entrance animations when the section scrolls into view.
- [ ] Responsive layout for mobile and desktop.
