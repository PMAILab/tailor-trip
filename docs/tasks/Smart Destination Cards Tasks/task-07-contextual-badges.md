# Task: Implement Contextual Badges

**Feature Area:** Smart Destination Cards
**Status:** Todo
**Priority:** High

## Description
Add contextual badges to the `DestinationCard` that provide at-a-glance environmental and logistical context. These badges help users quickly assess crowd levels and weather conditions without reading detailed descriptions.

## Badge Types
- **Crowd Level:** Low / Medium / High — color-coded (green → amber → red).
- **Weather Badge:** Pleasant / Hot / Rainy / Cold — with appropriate weather icons.

## Acceptance Criteria
- [ ] Create a reusable `Badge` sub-component that accepts a type and label.
- [ ] Render crowd-level badges with distinct colors (e.g., green for Low, amber for Medium, red for High).
- [ ] Render weather badges with matching icons (sun, cloud-rain, snowflake, thermometer).
- [ ] Ensure badges are included in the Gemini API prompt so the AI returns structured badge data.
- [ ] Update the `DestinationTag` type if needed to support crowd and weather badge semantics.
