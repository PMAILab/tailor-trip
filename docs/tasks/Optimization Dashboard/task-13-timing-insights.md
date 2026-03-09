# Task: Build Timing Insights Section

**Feature Area:** Optimization Dashboard
**Status:** Todo
**Priority:** High

## Description
Implement the **Timing Insights** section that helps users pick the optimal time to visit a destination. This section contains three visual sub-components: a cheapest-month graph, a crowd calendar, and a weather pattern indicator.

## Sub-Components
- **Cheapest Month Graph:** A bar or line chart showing estimated trip cost across 12 months, highlighting the cheapest month.
- **Crowd Calendar:** A color-coded 12-month grid (Low = green, Medium = amber, High = red) showing crowd levels per month.
- **Weather Pattern:** A monthly weather indicator showing conditions (Pleasant ☀️, Hot 🔥, Rainy 🌧️) for each month.

## Acceptance Criteria
- [ ] Create a `TimingInsights` component in `src/components/`.
- [ ] Implement a `CheapestMonthChart` sub-component displaying monthly cost data with the cheapest month visually highlighted.
- [ ] Implement a `CrowdCalendar` sub-component with a color-coded 12-month grid.
- [ ] Implement a `WeatherPattern` sub-component showing monthly weather icons/labels.
- [ ] All three sub-components should be stacked or tabbed within the section.
- [ ] Add interactive hover/tap states for chart elements.
- [ ] Responsive and visually consistent with the design system.
