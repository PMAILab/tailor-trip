# Feature 2: Smart Destination Cards

Reusable destination card component with image hover-flip, sentiment-aware imagery, and expandable AI explanations.

---

## Task List

### TripCard Component — `src/components/TripCard.tsx` [NEW]

- [ ] Extract inline card from `Explore.tsx` into a standalone reusable component
- [ ] Define props: `TripRecommendation` + `isSaved` + `onSave` + `onUnsave`
- [ ] **Thumbnail hover flip**: Smooth crossfade/slide transition through 2–3 hero images on hover
- [ ] **Sentiment-aware imagery**: Images are pre-filtered per destination sentiment
  - [ ] Spiritual places → cultural/temple/nature imagery only
  - [ ] Adventure places → trekking/outdoor imagery only
- [ ] Display fields:
  - [ ] Hero image
  - [ ] Destination name
  - [ ] Cost range
  - [ ] Cheapest month badge
  - [ ] Crowd level indicator
  - [ ] Weather badge
  - [ ] Expandable "Why this fits you" AI explanation
- [ ] Implement card states:
  - [ ] Default state
  - [ ] Saved state (filled heart icon)
  - [ ] Expanded state (AI reason visible)
- [ ] Animate expand/collapse using `motion` library

---

## Dependencies

- Phase 1 (types)
- Phase 3 (AppContext for save state)

## Outputs

- `src/components/TripCard.tsx`
