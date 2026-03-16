# Feature 3 (v2): AI-Generated Itinerary

A guided input form that generates a personalized day-by-day travel itinerary using Gemini.

---

## Task List

### Types — `src/types/types.ts` [MODIFY]

- [ ] Add `Interest` union type — `'food_cafes' | 'nature' | 'history' | 'nightlife' | 'adventure' | 'spiritual' | 'shopping'`
- [ ] Add `ActivitySlot` type — `activity`, `venue`, `duration`, `cost`, `reason`
- [ ] Add `ItineraryDay` type — `day`, `date`, `slots: { morning, afternoon, evening }`, `estimatedDayCost`
- [ ] Add `ItineraryInputs` type — `destination`, `startDate`, `endDate`, `partyType`, `budgetPerPerson`, `interests[]`, `dietaryPreference`, `pace`
- [ ] Add `SavedItinerary` type — `id`, `inputs: ItineraryInputs`, `days: ItineraryDay[]`, `generatedAt`

### State — `src/state/AppContext.tsx` [MODIFY]

- [ ] Add `savedItineraries: SavedItinerary[]` to `AppState`
- [ ] Hydrate `savedItineraries` from `localStorage` on mount
- [ ] Add `saveItinerary(itinerary: SavedItinerary)` action — persists to localStorage
- [ ] Add `deleteItinerary(id: string)` action

### Itinerary Feature Components — `src/features/itinerary/` [NEW]

#### Multi-Step Input Form

- [ ] `ItineraryBuilder.tsx`
  - [ ] Two-step form wizard (step 1 / step 2)
  - [ ] Step progress indicator at top (pill dots)
  - [ ] "Generate Itinerary" CTA button always visible; active from step 1 (smart defaults allow early submit)
  - [ ] Handles form state via `useReducer`

- [ ] `ItineraryBuilderStep1.tsx` — Steps 1–4
  - [ ] **Destination** — text input, pre-filled from navigation state
  - [ ] **Travel Dates** — From / To date pickers (native `<input type="date">`)
  - [ ] **Party Type** — pill select: Solo / Couple / Friends / Family
  - [ ] **Budget per person** — pill select: Under ₹5K / ₹5K–₹10K / ₹10K–₹20K / ₹20K+

- [ ] `ItineraryBuilderStep2.tsx` — Steps 5–7
  - [ ] **Interests** — multi-select chips (min 0, max 5): Food & Cafes, Nature, History, Nightlife, Adventure, Spiritual, Shopping
  - [ ] **Dietary Preference** — pill select: Veg / Non-Veg / Both (optional, defaults to "Both")
  - [ ] **Pace** — pill select: Relaxed / Moderate / Packed

#### Itinerary View

- [ ] `ItineraryView.tsx`
  - [ ] Header: destination name + dates + party type + edit inputs link
  - [ ] Toolbar: Save button, Share (copy to clipboard) button
  - [ ] Renders `<ItineraryDay />` for each day (streaming skeleton visible immediately)
  - [ ] "Regenerate All" button at bottom
  - [ ] Saved indicator badge

- [ ] `ItineraryDay.tsx`
  - [ ] Collapsible accordion per day (open by default)
  - [ ] Day header: "Day 1 — Mon, 4 Jul" + estimated day cost badge
  - [ ] Three slot sections: Morning / Afternoon / Evening
  - [ ] Renders `<ActivityCard />` per slot
  - [ ] "Refresh Day 🔄" icon button at day header → triggers `regenerateDay(dayNumber)`

- [ ] `ActivityCard.tsx`
  - [ ] Activity name (bold)
  - [ ] Venue name (secondary text)
  - [ ] Duration + cost on one line
  - [ ] AI reason in italic light text
  - [ ] Inline editable activity name on tap (contenteditable or small input)

#### Skeleton Loading

- [ ] `ItineraryDaySkeleton.tsx`
  - [ ] Renders placeholder shimmer for one day block while AI generates it
  - [ ] Shown until that day's SSE chunk arrives

### API Client — `src/lib/api.ts` [MODIFY]

- [ ] Add `generateItinerary(inputs: ItineraryInputs)` — calls `POST /api/itinerary/generate` via SSE
  - [ ] Parses incoming SSE JSON chunks (one per day)
  - [ ] Calls callback `onDayReceived(day: ItineraryDay)` as each day arrives
- [ ] Add `regenerateDay(itineraryId, dayNumber, originalInputs, existingDays)` — calls `POST /api/itinerary/regenerate-day` via SSE

### Custom Hook — `src/features/itinerary/useItinerary.ts` [NEW]

- [ ] State: `inputs`, `days: ItineraryDay[]`, `isGenerating`, `generatingDayNumbers: number[]`, `error`
- [ ] `generate(inputs)` — calls API, updates `days` incrementally as SSE chunks arrive
- [ ] `regenerateDay(dayNumber)` — calls regenerate API, replaces only that day in `days` array
- [ ] `saveItinerary()` — packages current state and calls `AppContext.saveItinerary()`
- [ ] `shareItinerary()` — converts `days` to plain text, copies to clipboard

### New Routes — `src/App.tsx` [MODIFY]

- [ ] Add `/itinerary/new` → `<ItineraryBuilder />`
- [ ] Add `/itinerary/:id` → `<ItineraryView />` (for saved itineraries)

### TripDetails Page — `src/pages/TripDetails.tsx` [MODIFY]

- [ ] Add "Generate Itinerary" button to the CTA area (Section F)
- [ ] On click → navigate to `/itinerary/new` with state `{ destination: trip.name, name: trip.name }`

### Shortlist Page — `src/pages/Shortlist.tsx` [MODIFY]

- [ ] Add "Plan This Trip →" action per saved trip card
- [ ] On click → navigate to `/itinerary/new` with state `{ destination: trip.name }`

### Backend — `server/routes/itinerary.ts` [NEW]

- [ ] `POST /api/itinerary/generate`
  - [ ] Validate body (all required inputs)
  - [ ] Calculate number of days from `startDate` / `endDate`
  - [ ] Build prompt from `server/prompts/itinerary.prompt.ts`
  - [ ] Call `gemini.generateContentStream()`
  - [ ] Parse stream; emit one SSE event per completed day JSON object
  - [ ] Save generated itinerary to `itineraries` DB table

- [ ] `POST /api/itinerary/regenerate-day`
  - [ ] Accept `dayNumber`, `originalInputs`, `alreadyGeneratedDays`
  - [ ] Build prompt instructing Gemini to regenerate only day `N`, given existing days as context (avoid repeating same activities)
  - [ ] Stream the single day SSE response
  - [ ] Update DB record

### Backend Prompt — `server/prompts/itinerary.prompt.ts` [NEW]

- [ ] Role: "expert Indian travel planner"
- [ ] Output format: strict JSON per day — system must describe exact schema
- [ ] Rules:
  - Respect `pace` (relaxed = 2 activities/day, packed = 4+)
  - Respect `dietaryPreference` in food recommendations
  - Respect `interests` — weight activities accordingly
  - All venues must be real, well-known Indian locations relevant to destination
  - Costs must be reasonably estimated ranges with "₹" prefix
  - AI reason must be 1 sentence, specific and useful
- [ ] Guardrail: "Do not invent venues that don't exist. If unsure, use well-known landmarks."

### SQLite — `server/db.ts` [MODIFY]

- [ ] Add `itineraries` table (see architecture schema)
- [ ] `saveItinerary(itinerary)` — INSERT OR REPLACE
- [ ] `getItinerary(id)` — SELECT + parse JSON fields
- [ ] `listItineraries()` — SELECT all for `user_id = 'local'`

---

## Dependencies

- Phase 1 v1 (types, constants)
- Phase 2 v1 (BFF + Gemini integration)
- Phase 3 v1 (AppContext, API client)
- Feature 1 v2 (useSSEStream hook)

## Outputs

- `src/types/types.ts` (modified)
- `src/state/AppContext.tsx` (modified)
- `src/features/itinerary/` (new folder — ItineraryBuilder, ItineraryView, ItineraryDay, ActivityCard, useItinerary, skeletons)
- `src/App.tsx` (modified — new routes)
- `src/lib/api.ts` (modified)
- `src/pages/TripDetails.tsx` (modified)
- `src/pages/Shortlist.tsx` (modified)
- `server/routes/itinerary.ts` (new)
- `server/prompts/itinerary.prompt.ts` (new)
- `server/db.ts` (modified — itineraries table)
