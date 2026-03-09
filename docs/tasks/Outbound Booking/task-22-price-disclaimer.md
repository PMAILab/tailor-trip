# Task: Display Price Disclaimer

**Feature Area:** Outbound Booking
**Status:** Todo
**Priority:** High

## Description
Add a clear and transparent **price disclaimer** near the booking CTA to inform users that the prices shown in TailorTrip are estimates and may vary on the actual OTA platform. This builds user trust and sets correct expectations before the hand-off.

## Implementation Details
- **Disclaimer Component:** Create a `PriceDisclaimer` component in `src/components/` that renders a subtle but visible disclaimer message.
- **Placement:** Display the disclaimer directly above the sticky `ActionCTABar` or inline near the "View Booking Options" button.
- **Copy:** Use clear, friendly language such as: *"Prices shown are estimates based on recent data. Actual prices on the booking platform may vary."*
- **Styling:** Use a muted, non-intrusive design (e.g., small text with an info icon) that doesn't distract from the CTA but is clearly readable.

## Acceptance Criteria
- [ ] Create a `PriceDisclaimer` component in `src/components/`.
- [ ] Display the disclaimer text: "Prices shown are estimates based on recent data. Actual prices on the booking platform may vary."
- [ ] Include a small info icon (ℹ️) alongside the text for visual clarity.
- [ ] Position the disclaimer near the "View Booking Options" CTA (above the sticky bar or inline).
- [ ] Style with muted colors and smaller font size to keep it non-intrusive.
- [ ] Ensure the disclaimer is visible on all screen sizes (responsive).
- [ ] Optionally make the disclaimer expandable/collapsible on tap for additional context.
