# Task: Implement Trade-Off Toggle

**Feature Area:** Optimization Dashboard
**Status:** Todo
**Priority:** High

## Description
Build a **Trade-Off Toggle** component that lets users switch between three optimization views — *Cheapest*, *Least Crowded*, and *Balanced*. Each view re-ranks or highlights the recommended travel window based on the selected priority, allowing the user to quickly see how their trip changes depending on what they optimize for.

## Toggle Modes
- **Cheapest:** Highlights the months/periods with the lowest cost. The Timing Insights section updates to emphasize cost savings.
- **Least Crowded:** Highlights the months/periods with the lowest crowd levels.
- **Balanced:** Shows a weighted recommendation balancing cost, crowd, and weather.

## Acceptance Criteria
- [ ] Create a `TradeOffToggle` component in `src/components/`.
- [ ] Render three toggle options: Cheapest, Least Crowded, Balanced.
- [ ] The active toggle should be visually distinct (e.g., highlighted pill/tab).
- [ ] Switching toggles should update the Trip Snapshot recommended month and the Timing Insights emphasis.
- [ ] Use smooth transitions when switching between modes.
- [ ] Default to "Balanced" on page load.
- [ ] Responsive design for all screen sizes.
