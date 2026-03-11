# Feature 4: Save & Shortlist

Persistent shortlist page showing saved destinations with management controls.

---

## Task List

### Shortlist Page — `src/pages/Shortlist.tsx` [MODIFY]

- [ ] Fetch saved trips from `GET /api/shortlist`
- [ ] Display thumbnail cards with:
  - [ ] Destination image
  - [ ] Cost range
  - [ ] Cheapest month info
  - [ ] Remove button
- [ ] Tap card → navigate to Trip Detail (`/trip/:id`)
- [ ] Implement remove functionality → calls `DELETE /api/shortlist/:id`
- [ ] Update context state on save/remove
- [ ] **Empty state**: Show "Start exploring to build your shortlist." with CTA button to `/`
- [ ] Handle loading state (skeleton cards)
- [ ] Handle error state with retry

---

## Dependencies

- Phase 2 (shortlist API)
- Phase 3 (API client, AppContext)
- Feature 2 (TripCard component — can reuse)

## Outputs

- Modified `src/pages/Shortlist.tsx`
