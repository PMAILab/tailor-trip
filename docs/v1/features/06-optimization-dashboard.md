# Feature 3: Optimization Dashboard (Trip Detail)

Full trip detail page with cost breakdown, timing insights, trade-off toggles, and booking CTA.

---

## Task List

### Trip Details Page — `src/pages/TripDetails.tsx` [MODIFY]

#### Trip Snapshot Section

- [ ] Fetch trip data from `GET /api/trips/:id`
- [ ] Implement hero image gallery with hover-to-flip through images
- [ ] Display destination name, total estimated cost, and duration

#### Cost Breakdown Section

- [ ] Render horizontal bar chart showing Travel / Stay / Food & Experiences split
- [ ] Show per-person cost estimate

#### Timing Insights Section

- [ ] Render simple bar chart for 12-month costs (highlight cheapest month)
- [ ] Color-coded crowd calendar (green = Low, yellow = Medium, red = High)
- [ ] Weather summary icons per month

#### Trade-Off Toggle

- [ ] Create 3 pill buttons: Cheapest / Least Crowded / Balanced
- [ ] On toggle → re-fetch with `?tradeOff=` param
- [ ] Update recommended month, cost, and crowd level based on selection

#### Budget Range Indicator

- [ ] Display which predefined budget range the trip falls into
- [ ] Visual affordability tag (e.g., "Budget Friendly", "Mid-Range")

#### CTA Section

- [ ] Save Trip button → calls shortlist API
- [ ] Compare Later button (disabled, visible as "Coming Soon")
- [ ] View Booking Options → opens external OTA link (MakeMyTrip/Goibibo)
- [ ] Track outbound click event via analytics

#### Loading & Error States

- [ ] Show skeleton/shimmer while data loads
- [ ] Handle errors with retry option
- [ ] Handle "Cost data unavailable" with placeholder

---

## Dependencies

- Phase 2 (trips API, shortlist API)
- Phase 3 (API client, AppContext)

## Outputs

- Modified `src/pages/TripDetails.tsx`
