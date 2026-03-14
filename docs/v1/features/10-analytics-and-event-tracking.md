# Phase 6: Analytics & Event Tracking

Track user behavior across the app for insights and optimization.

---

## Task List

### Analytics API — `server/routes/analytics.ts` [NEW]

- [ ] Implement `POST /api/events` endpoint
- [ ] Store events in SQLite `analytics_events` table
- [ ] Accept event payload: `{ event, properties?, timestamp }`
- [ ] Validate event name against known event types

### Frontend Analytics Helper — `src/lib/analytics.ts` [NEW]

- [ ] Create `trackEvent(name, properties?)` helper function
- [ ] Fire `POST /api/events` on each call
- [ ] Handle errors silently (analytics should never break UX)

### Instrument Events Across Pages

| Event | Trigger | File |
|-------|---------|------|
| `mood_selected` | User taps a mood card | `Home.tsx` |
| `card_viewed` | Destination card enters viewport | `Explore.tsx` |
| `card_expanded` | "Why this fits you" expanded | `TripCard.tsx` |
| `save_clicked` | Heart/save button pressed | `TripCard.tsx` |
| `explanation_opened` | AI reason section expanded | `TripCard.tsx` |
| `booking_outbound_click` | "View Booking Options" clicked | `TripDetails.tsx` |
| `trade_off_toggled` | Trade-off pill button switched | `TripDetails.tsx` |

- [ ] Add `mood_selected` tracking to `Home.tsx`
- [ ] Add `card_viewed` tracking to `Explore.tsx` (Intersection Observer)
- [ ] Add `card_expanded` tracking to `TripCard.tsx`
- [ ] Add `save_clicked` tracking to `TripCard.tsx`
- [ ] Add `explanation_opened` tracking to `TripCard.tsx`
- [ ] Add `booking_outbound_click` tracking to `TripDetails.tsx`
- [ ] Add `trade_off_toggled` tracking to `TripDetails.tsx`

---

## Dependencies

- Phase 2 (server setup)
- All feature pages (for instrumentation)

## Outputs

- `server/routes/analytics.ts`
- `src/lib/analytics.ts`
- Updated: `Home.tsx`, `Explore.tsx`, `TripCard.tsx`, `TripDetails.tsx`
