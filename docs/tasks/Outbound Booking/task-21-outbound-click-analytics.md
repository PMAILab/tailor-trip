# Task: Track Outbound Click Analytics

**Feature Area:** Outbound Booking
**Status:** Todo
**Priority:** High

## Description
Implement analytics tracking for outbound booking clicks to measure MVP success. Every time a user clicks "View Booking Options" and is redirected to an OTA, the event should be captured with relevant metadata. This data is critical for validating whether users progress from discovery to booking intent.

## Implementation Details
- **Analytics Service:** Create `src/services/analyticsService.ts` with a lightweight event-tracking utility.
- **Event Payload:** Each outbound click event should capture:
  - `destination_name` — the destination being booked.
  - `destination_cost_range` — estimated cost range shown to the user.
  - `cheapest_month` — the cheapest month displayed.
  - `mood` — the mood that led to this destination.
  - `timestamp` — when the click occurred.
  - `ota_partner` — which OTA the user was redirected to.
- **Storage for MVP:** Store events in `localStorage` as a JSON array (no backend needed for MVP).
- **Future-Ready:** Structure the service so it can easily be swapped to a real analytics backend (e.g., Google Analytics, Mixpanel) post-MVP.

## Acceptance Criteria
- [ ] Create `src/services/analyticsService.ts` with a `trackOutboundClick` function.
- [ ] Capture all required event fields (destination, cost, mood, timestamp, OTA partner).
- [ ] Store events in `localStorage` under a dedicated key (e.g., `tailortrip_analytics`).
- [ ] Integrate with the OTA redirection flow so every redirect automatically logs an event.
- [ ] Add a simple dev-only console log of the event for debugging purposes.
- [ ] Ensure no PII (personally identifiable information) is captured in events.
