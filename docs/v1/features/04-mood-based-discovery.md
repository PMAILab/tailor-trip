# Feature 1: Mood-Based Discovery

Users pick a mood and get AI-curated destination recommendations filtered by budget.

---

## Task List

### Home Page — `src/pages/Home.tsx` [MODIFY]

- [ ] Replace hardcoded mood data with imported `MOODS` from `constants.ts`
- [ ] On mood card click → set selected mood in context → navigate to `/explore?mood={id}`
- [ ] Remove the "Take Quiz" section (not in MVP scope)
- [ ] Add subtle tap animation using `motion` library

### Explore Page — `src/pages/Explore.tsx` [MODIFY]

- [ ] Read `mood` query param on mount
- [ ] Add **Budget Range Filter** — horizontal pill bar with predefined ranges:
  - [ ] "Under ₹5K"
  - [ ] "₹5K–₹10K"
  - [ ] "₹10K–₹20K"
  - [ ] "₹20K+"
- [ ] Selecting a range re-fetches recommendations filtered by budget
- [ ] Call `getRecommendations(mood, budgetRange)` via API client
- [ ] Show skeleton loading cards during fetch
- [ ] Replace hardcoded card data with real `TripRecommendation[]` response
- [ ] Heart/save button → calls `saveTripToShortlist()` and updates context
- [ ] Show saved state (filled heart) for already-saved trips
- [ ] Handle empty results → redirect to NoResults page

---

## Dependencies

- Phase 1 (types, constants)
- Phase 2 (recommendations API)
- Phase 3 (API client, AppContext)

## Outputs

- Modified `src/pages/Home.tsx`
- Modified `src/pages/Explore.tsx`
