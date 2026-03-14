# Phase 1: Foundation — Types, Data Models & Project Structure

Set up the shared type system and reorganize the project for a clean frontend-backend split.

---

## Task List

### Domain Types — `src/types/types.ts` [NEW]

- [ ] Define `Mood` type — `id`, `label`, `emoji`, `description`, `imageUrl`
- [ ] Define `Destination` type — `id`, `name`, `state`, `heroImages` (array), `sentiment`, `description`, `moods`, `durationDays`
- [ ] Define `BudgetRange` type — `id`, `label`, `min`, `max` (presets: "Under ₹5K", "₹5K–₹10K", "₹10K–₹20K", "₹20K+")
- [ ] Define `CostBreakdown` type — `travel`, `stay`, `foodAndExperiences`, `total`, `perPerson`
- [ ] Define `TimingInsight` type — `cheapestMonth`, `crowdLevel` (Low/Medium/High), `weather` (Pleasant/Hot/Rainy), `monthlyPrices` (12-month array)
- [ ] Define `TripRecommendation` type — `destination`, `costBreakdown`, `timingInsight`, `matchScore`, `aiReason`, `badges`
- [ ] Define `TradeOffMode` type — `'cheapest' | 'least_crowded' | 'balanced'`
- [ ] Define `UserPreferences` type — `name?`, `preferredBudgetRange?`, `moods?`, `savedTrips`

### Seed Data — `src/data/constants.ts` [NEW]

- [ ] Define 6 mood constants from PRD (with emoji, description, image URL)
- [ ] Define budget range presets (4 ranges)
- [ ] Curate ~20–30 Indian destinations with:
  - [ ] Mood tags per destination
  - [ ] Sentiment tags (spiritual, adventure, romantic, etc.)
  - [ ] 2–3 Google-sourced images per destination (sentiment-aware)
  - [ ] Seasonal cost arrays (12 months)
  - [ ] Crowd levels per month
  - [ ] Weather data per month

> [!IMPORTANT]
> **Image Sourcing**: Each destination must have 2–3 curated, sentiment-aware images. Spiritual destinations show only cultural/temple/nature imagery; adventure destinations show trekking/outdoor imagery.

---

## Dependencies

- None — this is the foundational phase.

## Outputs

- `src/types/types.ts`
- `src/data/constants.ts`
