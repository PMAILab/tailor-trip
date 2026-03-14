# Phase 5: Edge Cases & Error States

Handle loading, error, empty, and fallback states across the app.

---

## Task List

### NoResults Page — `src/pages/NoResults.tsx` [MODIFY]

- [ ] Connect to actual recommendation flow
- [ ] Show trending fallback destinations when mood yields no matches
- [ ] Display message: "Nothing matched perfectly — here's something trending instead."
- [ ] Add CTA to go back and explore other moods

### SkeletonCard Component — `src/components/SkeletonCard.tsx` [NEW]

- [ ] Create skeleton loading card matching TripCard dimensions
- [ ] Animate shimmer/pulse effect
- [ ] Used on Explore page during API fetch

### ErrorState Component — `src/components/ErrorState.tsx` [NEW]

- [ ] Create generic error state component
- [ ] Display "Something went wrong." message
- [ ] Include retry button with `onRetry` callback prop
- [ ] Accept optional custom error message

### Page-Level Error Handling

- [ ] **Explore.tsx** — Add loading state (skeleton cards)
- [ ] **Explore.tsx** — Add error state with retry
- [ ] **TripDetails.tsx** — Add loading state (shimmer)
- [ ] **TripDetails.tsx** — Add error state with retry
- [ ] **TripDetails.tsx** — Handle "Cost data unavailable" with placeholder text

---

## Dependencies

- Phase 3 (API client)
- Features 1–4 (pages to add states to)

## Outputs

- Modified `src/pages/NoResults.tsx`
- `src/components/SkeletonCard.tsx`
- `src/components/ErrorState.tsx`
- Updated `src/pages/Explore.tsx`, `src/pages/TripDetails.tsx`
