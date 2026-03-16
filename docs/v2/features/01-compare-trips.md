# Feature 1 (v2): Compare Trips

Side-by-side comparison of 2–3 saved destinations with an AI-generated verdict.

---

## Task List

### Types — `src/types/types.ts` [MODIFY]

- [ ] Add `CompareSelection` type — `destinationIds: string[]` (min 2, max 3)
- [ ] Add `CompareVerdict` type — `text: string`, `winnerId?: string`

### State — `src/state/AppContext.tsx` [MODIFY]

- [ ] Add `compareSelection: string[]` to `AppState`
- [ ] Add `addToCompare(id: string)` action — max 3; toast warning if exceeded
- [ ] Add `removeFromCompare(id: string)` action
- [ ] Add `clearCompare()` action

### Compare Feature Components — `src/features/compare/` [NEW]

- [ ] `CompareGrid.tsx`
  - [ ] Renders horizontal scrollable grid (rows = dimensions, columns = destinations)
  - [ ] Sticky row labels on left side for small screens
  - [ ] Rows: Hero image, Name, Total Cost, Cost Breakdown (bar), Cheapest Month, Crowd, Weather, Duration, AI Match Score
  - [ ] Highlight best value per row in green pill
- [ ] `CompareColumn.tsx`
  - [ ] Single destination column header with hero image + name
  - [ ] "Remove" (×) icon to swap out destination
  - [ ] "Book This Trip" CTA at column bottom
- [ ] `CompareAIVerdict.tsx`
  - [ ] Streaming text card below grid
  - [ ] Shows typing indicator (animated dots) while streaming
  - [ ] "Regenerate" icon to re-trigger verdict

### API Client — `src/lib/api.ts` [MODIFY]

- [ ] Add `getCompareVerdict(destinations, mood, budgetRange)` — calls `POST /api/compare/verdict` via SSE
- [ ] Add `useSSEStream(url, body)` hook in `src/lib/useSSEStream.ts` [NEW] — manages `EventSource`, returns `{ text, isStreaming, error }`

### Compare Page — `src/pages/Compare.tsx` [MODIFY]

- [ ] If `compareSelection.length < 2` → show empty state: "Add at least 2 trips to compare. Go to Shortlist →"
- [ ] Render `<CompareGrid />` with destinations resolved from context
- [ ] Render `<CompareAIVerdict />` after grid
- [ ] On mount, trigger `getCompareVerdict()` automatically
- [ ] "Add Destination" button (if < 3) → opens Shortlist picker modal

### Shortlist Page — `src/pages/Shortlist.tsx` [MODIFY]

- [ ] Add "Compare Selected" button — enabled when ≥ 2 trips saved
- [ ] Add checkbox/toggle per trip card for compare selection
- [ ] Compare FAB: show count badge when 1–3 trips selected (`compareSelection.length`)

### TripDetails Page — `src/pages/TripDetails.tsx` [MODIFY]

- [ ] "Compare Later" button is now **active** (was disabled in v1)
- [ ] Tapping it → calls `addToCompare(id)` + shows toast "Added to Compare (N/3)"

### Explore Page — `src/pages/Explore.tsx` [MODIFY]

- [ ] Show Compare FAB when `compareSelection.length >= 2`
- [ ] FAB taps → navigate to `/compare`

### Backend — `server/routes/compare.ts` [NEW]

- [ ] `POST /api/compare/verdict`
  - [ ] Validate body: 2–3 destinations, required fields
  - [ ] Build prompt from `server/prompts/compare.prompt.ts`
  - [ ] Call `gemini.generateContentStream()`
  - [ ] Pipe SSE response to client

### Backend Prompt — `server/prompts/compare.prompt.ts` [NEW]

- [ ] System prompt: role = "senior travel advisor", domain = India travel
- [ ] Input: destination names, cost ranges, timing, crowd, AI match scores, user mood + budget
- [ ] Output format: 2–3 sentence recommendation; explicitly name the winner and why
- [ ] Guardrail: no booking confirmations, no real-time price claims

---

## Dependencies

- Phase 1 v1 (types, constants)
- Phase 2 v1 (BFF + Gemini integration)
- Phase 3 v1 (API client, AppContext)
- Feature 7 v1 (Shortlist / Save)

## Outputs

- `src/types/types.ts` (modified)
- `src/state/AppContext.tsx` (modified)
- `src/features/compare/` (new folder)
- `src/lib/useSSEStream.ts` (new)
- `src/pages/Compare.tsx` (upgraded)
- `src/pages/Shortlist.tsx` (modified)
- `src/pages/TripDetails.tsx` (modified)
- `src/pages/Explore.tsx` (modified)
- `server/routes/compare.ts` (new)
- `server/prompts/compare.prompt.ts` (new)
