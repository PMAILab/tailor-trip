# TailorTrip MVP Implementation Plan

Comprehensive implementation plan to transform the existing static UI scaffold into a fully functional AI-powered travel discovery MVP, based on the [PRD](file:///d:/TailorTrip/tailor-trip/docs/prd/Tailor%20Trip%20Mvp%20Prd.docx) and [architecture doc](file:///d:/TailorTrip/tailor-trip/docs/architecture/architecture.md).

> [!NOTE]
> **AI Model**: All Gemini calls use the **Gemini 3.1 Pro** model.
> **Image Policy**: All destination images must be relevant to the place, sourced from Google (free/licensed), and sentiment-aware (e.g., no non-veg or violence imagery for spiritual destinations).

## Current State Assessment

The codebase is a **Vite + React + TypeScript + Tailwind CSS v4** SPA with:
- ✅ Route structure for 7 pages (Home, Explore, TripDetails, Shortlist, Profile, Compare, NoResults)
- ✅ Visual UI scaffold with mood cards, destination cards, and trip detail layout
- ❌ All data is **hardcoded inline** in page components
- ❌ No backend server (Express, SQLite, Gemini packages installed but unused)
- ❌ No state management (no Context, no store, no localStorage)
- ❌ No API client layer
- ❌ No domain types/models
- ❌ No loading/error/empty states
- ❌ No cross-page persistence (shortlist, profile preferences)
- ❌ No analytics/event tracking

---

## Proposed Changes

### Phase 1: Foundation — Types, Data Models & Project Structure

Set up the shared type system and reorganize the project for a clean frontend-backend split.

---

#### [NEW] [types.ts](file:///d:/TailorTrip/tailor-trip/src/types/types.ts)

Central domain model definitions:

| Type | Fields |
|------|--------|
| `Mood` | `id`, `label`, `emoji`, `description`, `imageUrl` |
| `Destination` | `id`, `name`, `state`, `heroImages` (array — multiple images for hover flip), `sentiment` (spiritual/adventure/romantic/etc.), `description`, `moods`, `durationDays` |
| `BudgetRange` | `id`, `label`, `min`, `max` — predefined ranges: "Under ₹5K", "₹5K–₹10K", "₹10K–₹20K", "₹20K+" |
| `CostBreakdown` | `travel`, `stay`, `foodAndExperiences`, `total`, `perPerson` |
| `TimingInsight` | `cheapestMonth`, `crowdLevel` (enum: Low/Medium/High), `weather` (enum: Pleasant/Hot/Rainy), `monthlyPrices` (12-month array) |
| `TripRecommendation` | `destination`, `costBreakdown`, `timingInsight`, `matchScore`, `aiReason`, `badges` |
| `TradeOffMode` | `'cheapest' \| 'least_crowded' \| 'balanced'` |
| `UserPreferences` | `name?`, `preferredBudgetRange?`, `moods?`, `savedTrips` |

---

#### [NEW] [constants.ts](file:///d:/TailorTrip/tailor-trip/src/data/constants.ts)

Static mood definitions (the 6 moods from PRD), **budget range presets**, and destination master list (~20-30 Indian destinations with mood tags, sentiment tags, multiple images per destination, seasonal cost arrays, crowd levels, weather by month).

> [!IMPORTANT]
> **Image Sourcing**: Each destination has 2-3 curated Google-sourced images tagged with place sentiment. Images are filtered by mood context — e.g., spiritual destinations (Varanasi, Rishikesh) will only show temple, river, and prayer imagery; adventure destinations will show trekking and outdoor imagery.

> [!IMPORTANT]
> This is the seed data that powers the MVP. In v1, the Gemini AI generates personalized "Why this fits you" explanations, while the matching/scoring/cost data comes from this curated dataset.

---

### Phase 2: Express Backend (BFF)

Stand up a lightweight Express server that sits between the React frontend and the Gemini AI.

---

#### [NEW] [server/index.ts](file:///d:/TailorTrip/tailor-trip/server/index.ts)

Express server entry point. Loads `.env`, initializes SQLite, mounts API routes. Runs on port 3001.

#### [NEW] [server/db.ts](file:///d:/TailorTrip/tailor-trip/server/db.ts)

SQLite setup via `better-sqlite3`:
- **Tables**: `destinations`, `monthly_data` (cost/crowd/weather per month), `user_preferences`, `saved_trips`, `analytics_events`
- **Seed script**: Populate `destinations` and `monthly_data` from `constants.ts` data

#### [NEW] [server/routes/recommendations.ts](file:///d:/TailorTrip/tailor-trip/server/routes/recommendations.ts)

`POST /api/recommendations`
- **Input**: `{ mood: string, budgetRange?: BudgetRange, tradeOff?: TradeOffMode }`
- **Logic**:
  1. Query destinations matching the mood cluster
  2. **Filter by budget range** (if provided, only include destinations whose estimated total falls within the selected range)
  3. Apply seasonal scoring (current month's cost, crowd, weather)
  4. Rank by composite score (budget fit × crowd preference × mood match)
  5. Call **Gemini 3.1 Pro** to generate personalized "Why this fits you" for top 6-8 results
  6. Return `TripRecommendation[]`

#### [NEW] [server/routes/trips.ts](file:///d:/TailorTrip/tailor-trip/server/routes/trips.ts)

`GET /api/trips/:id`
- Returns full destination detail with cost breakdown, 12-month price data, crowd calendar, weather patterns
- Accepts `?tradeOff=cheapest|least_crowded|balanced` to adjust the recommended month/cost

#### [NEW] [server/routes/shortlist.ts](file:///d:/TailorTrip/tailor-trip/server/routes/shortlist.ts)

- `GET /api/shortlist` — list saved destinations
- `POST /api/shortlist` — save a destination
- `DELETE /api/shortlist/:id` — remove from shortlist

#### [NEW] [server/routes/profile.ts](file:///d:/TailorTrip/tailor-trip/server/routes/profile.ts)

- `GET /api/profile` — get user preferences
- `POST /api/profile` — update preferences (name, preferred budget range, mood preferences)

#### [NEW] [server/services/gemini.ts](file:///d:/TailorTrip/tailor-trip/server/services/gemini.ts)

Gemini AI service using `@google/genai` with **Gemini 3.1 Pro** model:
- Generates "Why this fits you" explanations per destination + mood combo
- Structured prompt with mood context, destination attributes, cost data, and timing insights
- Returns concise, personalized 1-2 sentence explanations

#### [MODIFY] [vite.config.ts](file:///d:/TailorTrip/tailor-trip/vite.config.ts)

Add Vite proxy to forward `/api/*` requests to Express server on port 3001.

#### [MODIFY] [package.json](file:///d:/TailorTrip/tailor-trip/package.json)

Add scripts:
- `"server"` — run Express with `tsx server/index.ts`
- `"dev:all"` — concurrently run Vite + Express

---

### Phase 3: Frontend State Management & API Client

---

#### [NEW] [api.ts](file:///d:/TailorTrip/tailor-trip/src/lib/api.ts)

Typed fetch wrappers for all backend endpoints:
- `getRecommendations(mood, budget?, tradeOff?)`
- `getTripDetails(id, tradeOff?)`
- `getShortlist()`, `saveToShortlist(id)`, `removeFromShortlist(id)`
- `getProfile()`, `updateProfile(prefs)`

#### [NEW] [AppContext.tsx](file:///d:/TailorTrip/tailor-trip/src/state/AppContext.tsx)

React Context provider wrapping the app with:
- `shortlist: TripRecommendation[]` — track saved trips across pages
- `profile: UserPreferences` — user preferences (name, budget range, moods)
- `selectedMood: Mood | null` — current mood selection
- `selectedBudget: BudgetRange | null` — active budget filter
- Actions: `saveTripToShortlist`, `removeTripFromShortlist`, `updateProfile`, `setMood`, `setBudgetRange`
- Persistence: calls backend API and caches in state

---

### Phase 4: Feature Implementation (5 MVP Features)

---

#### Feature 1: Mood-Based Discovery

##### [MODIFY] [Home.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/Home.tsx)

- Replace hardcoded mood data with imported `MOODS` from constants
- On mood card click: set selected mood in context → navigate to `/explore?mood={id}`
- Remove the "Take Quiz" section (not in MVP scope)
- Add subtle tap animation (using `motion` library already installed)

##### [MODIFY] [Explore.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/Explore.tsx)

- Read `mood` query param on mount
- **Budget Range Filter**: Horizontal pill bar with predefined ranges ("Under ₹5K", "₹5K–₹10K", "₹10K–₹20K", "₹20K+") — selecting a range re-fetches recommendations filtered by budget
- Call `getRecommendations(mood, budgetRange)` via API client
- Show skeleton loading cards during fetch
- Replace hardcoded card data with real `TripRecommendation[]` response
- Heart/save button: calls `saveTripToShortlist()` and updates context
- Show saved state (filled heart) for already-saved trips

---

#### Feature 2: Smart Destination Cards

##### [NEW] [TripCard.tsx](file:///d:/TailorTrip/tailor-trip/src/components/TripCard.tsx)

Extract the `TripCard` inline component from `Explore.tsx` into a reusable component:
- Props: `TripRecommendation` + `isSaved` + `onSave` + `onUnsave`
- **Thumbnail hover flip**: Card has 2-3 hero images — on hover, smoothly transitions (crossfade or slide) to the next image, giving a carousel preview effect
- **Sentiment-aware imagery**: Images are pre-filtered per destination sentiment (e.g., spiritual places show only cultural/temple/nature imagery)
- Display: hero image, name, cost range, cheapest month badge, crowd level, weather badge, expandable "Why this fits you" AI explanation
- Card states: Default, Saved (filled heart), Expanded (AI reason visible)
- Animate expand/collapse with `motion`

---

#### Feature 3: Optimization Dashboard (Trip Detail)

##### [MODIFY] [TripDetails.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/TripDetails.tsx)

Major overhaul — fetch real data and add interactive sections:

| Section | Implementation |
|---------|---------------|
| **Trip Snapshot** | Fetch from `GET /api/trips/:id` — hero image gallery (hover to flip through images), name, total estimated cost, duration |
| **Cost Breakdown** | Horizontal bar chart showing Travel / Stay / Food split with per-person estimate |
| **Timing Insights** | Simple bar chart for 12-month costs (highlight cheapest), color-coded crowd calendar (green/yellow/red per month), weather summary icons |
| **Trade-Off Toggle** | 3 pill buttons (Cheapest / Least Crowded / Balanced) — re-fetch with `?tradeOff=` param to update recommended month, cost, and crowd |
| **Budget Range Indicator** | Shows which predefined budget range ("Under ₹5K", "₹5K–₹10K", etc.) this trip falls into, with a visual affordability tag |
| **CTA Section** | Save Trip button (calls shortlist API), Compare Later (disabled, visible), View Booking Options (opens external OTA link, tracks click) |

---

#### Feature 4: Save & Shortlist

##### [MODIFY] [Shortlist.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/Shortlist.tsx)

- Fetch saved trips from `GET /api/shortlist`
- Display thumbnail cards with cost range, cheapest month, remove button
- Empty state: "Start exploring to build your shortlist." with CTA to `/`
- Tap card → navigate to Trip Detail

---

#### Feature 5: Outbound Booking

##### [MODIFY] [TripDetails.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/TripDetails.tsx)

- "View Booking Options" button opens a partner OTA link (e.g., MakeMyTrip, Goibibo search URL with destination pre-filled)
- Track outbound click event via analytics API
- Show disclaimer: "Prices are estimated and may vary."

---

### Phase 5: Edge Cases & Error States

---

#### [MODIFY] [NoResults.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/NoResults.tsx)

- Connected to actual recommendation flow
- Shows trending fallback destinations when mood yields no matches
- Message: "Nothing matched perfectly — here's something trending instead."

#### [NEW] [SkeletonCard.tsx](file:///d:/TailorTrip/tailor-trip/src/components/SkeletonCard.tsx)

Skeleton loading card component for Explore page during API fetch.

#### [NEW] [ErrorState.tsx](file:///d:/TailorTrip/tailor-trip/src/components/ErrorState.tsx)

Generic error state component: "Something went wrong. Retry." with retry button.

#### Explore.tsx and TripDetails.tsx updates:
- Add loading states (skeleton cards / shimmer)
- Add error states with retry
- Handle "Cost data unavailable" → "Data updating" placeholder

---

### Phase 6: Analytics & Event Tracking

---

#### [NEW] [server/routes/analytics.ts](file:///d:/TailorTrip/tailor-trip/server/routes/analytics.ts)

`POST /api/events` — store analytics events in SQLite `analytics_events` table.

#### [NEW] [analytics.ts](file:///d:/TailorTrip/tailor-trip/src/lib/analytics.ts)

Frontend analytics helper that fires events:

| Event | Trigger |
|-------|---------|
| `mood_selected` | User taps a mood card |
| `card_viewed` | Destination card enters viewport |
| `card_expanded` | "Why this fits you" expanded |
| `save_clicked` | Heart/save button pressed |
| `explanation_opened` | AI reason section expanded |
| `booking_outbound_click` | "View Booking Options" clicked |
| `trade_off_toggled` | Trade-off pill button switched |

---

### Phase 7: Polish & Performance

---

#### [MODIFY] [Layout.tsx](file:///d:/TailorTrip/tailor-trip/src/components/Layout.tsx)

- Header search box: make functional (filters destinations by name)
- Active nav link highlighting based on current route
- Show shortlist count badge on Shortlist nav link

#### [MODIFY] [Compare.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/Compare.tsx)

- Keep as a "Coming Soon" placeholder (Phase 2 per PRD)
- Show message: "Side-by-side comparison coming soon"

#### [MODIFY] [Profile.tsx](file:///d:/TailorTrip/tailor-trip/src/pages/Profile.tsx)

- Wire up to `GET/POST /api/profile`
- Functional name input field
- Preferred budget range selector (dropdown/pills)
- Save preferences to backend
- Travel preference chips (informational for MVP)

#### General Polish:
- Add `motion` (Framer Motion) page transitions and micro-animations
- Ensure mobile-first responsive behavior
- Add proper `<title>` and `<meta>` tags per page
- Ensure all interactive elements have unique IDs for testing

---

## Summary of All Files

### New Files (15)

| File | Purpose |
|------|---------|
| `src/types/types.ts` | Shared domain types |
| `src/data/constants.ts` | Mood definitions & destination seed data |
| `src/lib/api.ts` | Typed API client |
| `src/lib/analytics.ts` | Event tracking helper |
| `src/state/AppContext.tsx` | Global state via React Context |
| `src/components/TripCard.tsx` | Reusable destination card |
| `src/components/SkeletonCard.tsx` | Loading skeleton |
| `src/components/ErrorState.tsx` | Error state UI |
| `server/index.ts` | Express entry point |
| `server/db.ts` | SQLite setup + seed |
| `server/services/gemini.ts` | Gemini AI wrapper |
| `server/routes/recommendations.ts` | Recommendation API |
| `server/routes/trips.ts` | Trip detail API |
| `server/routes/shortlist.ts` | Shortlist CRUD |
| `server/routes/profile.ts` | Profile CRUD |
| `server/routes/analytics.ts` | Event tracking API |

### Modified Files (10)

| File | Changes |
|------|---------|
| `vite.config.ts` | Add API proxy |
| `package.json` | Add server/dev scripts |
| `src/App.tsx` | Wrap with `AppProvider` |
| `src/pages/Home.tsx` | Dynamic moods, navigation with mood param |
| `src/pages/Explore.tsx` | API-driven cards, loading/error states |
| `src/pages/TripDetails.tsx` | Full dashboard with real data, trade-offs, budget range indicator |
| `src/pages/Shortlist.tsx` | API-driven saved trips, empty state |
| `src/pages/Profile.tsx` | Functional preferences form |
| `src/pages/NoResults.tsx` | Connected to recommendation flow |
| `src/components/Layout.tsx` | Active nav, shortlist badge, functional search |

---

## User Review Required

> [!IMPORTANT]
> **Gemini API Key**: The app requires a valid `GEMINI_API_KEY` in `.env` for the **Gemini 3.1 Pro** model. Please confirm you have one configured.

> [!IMPORTANT]
> **Destination Data Scope**: The MVP seed data will include ~20-30 Indian destinations with 2-3 sentiment-aware Google-sourced images each. Should we aim for a specific list of destinations, or is a curated mix of popular + offbeat locations acceptable?

> [!WARNING]
> **No User Authentication**: The PRD specifies "no mandatory login." For MVP, all data (saved trips, preferences) is session-based via a simple device ID stored in localStorage. This means data won't persist across different browsers/devices. Is this acceptable for MVP?

---

## Verification Plan

### Automated Tests

1. **TypeScript compilation check**:
   ```bash
   npx tsc --noEmit
   ```
   Ensures all types are correctly defined and used across the codebase.

2. **Vite build check**:
   ```bash
   npm run build
   ```
   Verifies the frontend bundles successfully without errors.

3. **Express server startup check**:
   ```bash
   npx tsx server/index.ts
   ```
   Verify server starts on port 3001 and logs "Server running" within 5 seconds, then terminate.

### Browser-Based Verification

4. **Mood → Recommendations Flow**: 
   - Start dev servers (`npm run dev` + server)
   - Open `http://localhost:3000`
   - Click a mood card → verify redirect to `/explore?mood=...`
   - Verify recommendation cards load (not hardcoded static data)
   - Verify "Why this fits you" expandable section works

5. **Trip Detail Dashboard**:
   - Click "View Details" on a recommendation card
   - Verify Trip Snapshot (with image hover-flip), Cost Breakdown, Timing Insights sections render
   - Toggle trade-off pills (Cheapest / Least Crowded / Balanced) → verify data updates
   - Verify budget range indicator shows correct affordability tag

6. **Save & Shortlist Flow**:
   - On Explore page, click heart icon on a card → verify it toggles to filled/saved state
   - Navigate to `/shortlist` → verify saved trip appears
   - Click remove → verify trip disappears
   - Verify empty state message when no trips are saved

7. **Profile Page**:
   - Navigate to `/profile`
   - Enter name, select budget range → save
   - Navigate away and return → verify preferences persist

### Manual Verification (by user)

8. **Visual UX Review**: User reviews the overall look-and-feel against the PRD design guidelines (intelligent, clean, minimal, data-forward, trustworthy), ensuring no clutter or OTA-like patterns.

9. **Mobile Responsiveness**: User tests the app on a mobile browser (or Chrome DevTools mobile view) to verify the mobile-first layout behaves correctly on iPhone-sized screens.
