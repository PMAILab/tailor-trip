# Feature 5: Outbound Booking

External booking links with click tracking and disclaimers.

---

## Task List

### Trip Details Integration — `src/pages/TripDetails.tsx` [MODIFY]

- [ ] Add "View Booking Options" button in CTA section
- [ ] On click → open partner OTA link in new tab:
  - [ ] MakeMyTrip search URL with destination pre-filled
  - [ ] Goibibo search URL as fallback
- [ ] Track `booking_outbound_click` event via analytics API
- [ ] Show disclaimer text: "Prices are estimated and may vary."

---

## Dependencies

- Phase 2 (analytics API)
- Feature 3 (Trip Detail page structure)

## Outputs

- Modified `src/pages/TripDetails.tsx` (CTA section)
