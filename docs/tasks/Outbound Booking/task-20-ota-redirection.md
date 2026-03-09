# Task: Implement OTA Redirection

**Feature Area:** Outbound Booking
**Status:** Todo
**Priority:** Critical

## Description
Implement the core outbound booking flow that redirects users to a partner **Online Travel Agency (OTA)** when they tap the "View Booking Options" CTA. This is the final hand-off point from TailorTrip's discovery engine to the actual booking stage. The redirection should open the OTA link in a new browser tab with relevant destination context (e.g., destination name, dates if available).

## Implementation Details
- **OTA Link Service:** Create a utility/service (`src/services/otaService.ts`) that constructs OTA redirect URLs based on destination data (name, cheapest month, etc.).
- **Partner URLs:** Use configurable placeholder partner URLs for MVP (e.g., MakeMyTrip, Goibibo, Booking.com patterns).
- **Deep Linking:** Construct URLs with query parameters so the OTA pre-fills the destination, check-in month, and duration where possible.
- **Integration Point:** Wire the "View Booking Options" button in the `ActionCTABar` component to use this service.

## Acceptance Criteria
- [ ] Create `src/services/otaService.ts` with a function to generate OTA redirect URLs.
- [ ] Support at least one OTA partner URL pattern (e.g., MakeMyTrip or Booking.com).
- [ ] "View Booking Options" button opens the OTA link in a new tab (`window.open` with `_blank`).
- [ ] Pass destination name and cheapest month as URL parameters where supported.
- [ ] Handle edge cases: missing data gracefully falls back to a generic search URL.
- [ ] Add a brief loading/transition animation on button click before redirect.
