# Phase 2: Express Backend (BFF)

Stand up a lightweight Express server that sits between the React frontend and the Gemini AI.

---

## Task List

### Server Entry Point — `server/index.ts` [NEW]

- [ ] Create Express server entry point
- [ ] Load `.env` configuration
- [ ] Initialize SQLite database connection
- [ ] Mount all API route groups
- [ ] Configure server to run on port 3001

### Database — `server/db.ts` [NEW]

- [ ] Set up SQLite via `better-sqlite3`
- [ ] Create `destinations` table
- [ ] Create `monthly_data` table (cost/crowd/weather per month)
- [ ] Create `user_preferences` table
- [ ] Create `saved_trips` table
- [ ] Create `analytics_events` table
- [ ] Write seed script to populate `destinations` and `monthly_data` from `constants.ts`

### Recommendations API — `server/routes/recommendations.ts` [NEW]

- [ ] Implement `POST /api/recommendations` endpoint
- [ ] Accept input: `{ mood, budgetRange?, tradeOff? }`
- [ ] Query destinations matching the mood cluster
- [ ] Filter by budget range (if provided)
- [ ] Apply seasonal scoring (current month's cost, crowd, weather)
- [ ] Rank by composite score (budget fit × crowd preference × mood match)
- [ ] Call Gemini 3.1 Pro for "Why this fits you" explanations (top 6–8 results)
- [ ] Return `TripRecommendation[]`

### Trip Detail API — `server/routes/trips.ts` [NEW]

- [ ] Implement `GET /api/trips/:id`
- [ ] Return full destination detail with cost breakdown, 12-month price data, crowd calendar, weather
- [ ] Support `?tradeOff=cheapest|least_crowded|balanced` query param

### Shortlist API — `server/routes/shortlist.ts` [NEW]

- [ ] Implement `GET /api/shortlist` — list saved destinations
- [ ] Implement `POST /api/shortlist` — save a destination
- [ ] Implement `DELETE /api/shortlist/:id` — remove from shortlist

### Profile API — `server/routes/profile.ts` [NEW]

- [ ] Implement `GET /api/profile` — get user preferences
- [ ] Implement `POST /api/profile` — update preferences (name, budget range, moods)

### Gemini AI Service — `server/services/gemini.ts` [NEW]

- [ ] Initialize `@google/genai` with Gemini 3.1 Pro model
- [ ] Build structured prompt with mood context, destination attributes, cost data, timing insights
- [ ] Generate personalized 1–2 sentence "Why this fits you" explanations
- [ ] Handle API errors and rate limits gracefully

### Config Updates

- [ ] **`vite.config.ts`** [MODIFY] — Add Vite proxy to forward `/api/*` to Express on port 3001
- [ ] **`package.json`** [MODIFY] — Add `"server"` script (`tsx server/index.ts`)
- [ ] **`package.json`** [MODIFY] — Add `"dev:all"` script (concurrently run Vite + Express)

---

## Dependencies

- Phase 1 (types & seed data)

## Outputs

- `server/index.ts`, `server/db.ts`, `server/services/gemini.ts`
- `server/routes/recommendations.ts`, `server/routes/trips.ts`, `server/routes/shortlist.ts`, `server/routes/profile.ts`
- Updated `vite.config.ts`, `package.json`
