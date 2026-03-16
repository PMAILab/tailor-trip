# TailorTrip Architecture — v2

## 1. What Changed from v1

v1 shipped a React SPA with a Vite + TypeScript frontend, an Express BFF, SQLite for persistence, and Gemini as the AI backend.

v2 adds three new feature areas on top of this foundation:

| Feature | New Frontend Modules | New Backend Endpoints |
|---------|---------------------|----------------------|
| Compare Trips | `Compare.tsx` (upgraded), `CompareGrid`, `CompareAIVerdict` | `POST /api/compare/verdict` |
| AI Chatbot | `ChatPanel`, `ChatMessage`, `ChatFAB` | `POST /api/chat/message` |
| AI Itinerary | `ItineraryBuilder`, `ItineraryDay`, `ActivityCard` | `POST /api/itinerary/generate`, `POST /api/itinerary/regenerate-day` |

The v1 architecture layering is preserved:

```
React Client (UI + Router)
  → /src/lib/api  (fetch wrappers)
      → Express BFF /server
          → Gemini API
          → SQLite (better-sqlite3)
```

---

## 2. High-Level Architecture (v2)

```text
Browser
  └── Vite-bundled React SPA
        ├── App.tsx (updated route table)
        ├── Layout.tsx (ChatFAB injected here)
        └── Pages / Features
              ├── /compare          → Compare (upgraded)
              ├── /itinerary/new    → ItineraryBuilder (NEW)
              ├── /itinerary/:id    → ItineraryView (NEW)
              └── <ChatPanel />     → Floating overlay (all routes)

Express BFF (/server)
  ├── POST /api/recommendations     (v1)
  ├── GET  /api/trips/:id           (v1)
  ├── GET|POST /api/shortlist       (v1)
  ├── GET|POST /api/profile         (v1)
  ├── POST /api/compare/verdict     (v2 NEW)
  ├── POST /api/chat/message        (v2 NEW)
  ├── POST /api/itinerary/generate  (v2 NEW)
  └── POST /api/itinerary/regenerate-day  (v2 NEW)

SQLite (better-sqlite3)
  ├── trips         (v1)
  ├── shortlist     (v1)
  ├── preferences   (v1)
  ├── itineraries   (v2 NEW)
  └── chat_sessions (v2 NEW — session-scoped, optional)
```

---

## 3. Frontend Structure (v2 additions)

### 3.1 Route Table Updates

```
/                    → Home
/explore             → Explore
/trip/:id            → TripDetails
/shortlist           → Shortlist
/compare             → Compare          ← upgraded (was stub in v1)
/itinerary/new       → ItineraryBuilder ← NEW
/itinerary/:id       → ItineraryView    ← NEW
/profile             → Profile
/no-results          → NoResults
```

### 3.2 New Components

#### Compare Feature

```
src/features/compare/
  CompareGrid.tsx          — Scrollable side-by-side table
  CompareColumn.tsx        — Single destination column
  CompareRow.tsx           — Single comparison dimension row
  CompareAIVerdict.tsx     — Streaming AI recommendation card
  useCompare.ts            — State: selected destinations (2–3), verdict
```

#### Chatbot Feature

```
src/features/chat/
  ChatFAB.tsx              — Floating action button (injected in Layout)
  ChatPanel.tsx            — Slide-up bottom sheet
  ChatMessage.tsx          — Single message bubble (user / AI)
  ChatQuickReplies.tsx     — Preset chip suggestions
  useChat.ts               — State: messages[], isOpen, isStreaming
  chatContext.ts           — Context: current mood, shortlist, active trip
```

#### Itinerary Feature

```
src/features/itinerary/
  ItineraryBuilder.tsx     — Multi-step input form (2 screens)
  ItineraryBuilderStep1.tsx — Destination, dates, party, budget
  ItineraryBuilderStep2.tsx — Interests, dietary, pace
  ItineraryView.tsx        — Full generated itinerary display
  ItineraryDay.tsx         — Day accordion (morning / afternoon / evening)
  ActivityCard.tsx         — Single activity tile
  useItinerary.ts          — State: inputs, generatedDays[], isGenerating
```

### 3.3 Updated AppContext

`src/state/AppContext.tsx` is extended to include:

```ts
interface AppState {
  // v1 (unchanged)
  selectedMood: Mood | null
  budgetRange: BudgetRange | null
  shortlist: TripRecommendation[]
  userPreferences: UserPreferences

  // v2 additions
  compareSelection: string[]           // destination IDs selected for compare (max 3)
  chatOpen: boolean
  savedItineraries: SavedItinerary[]   // persisted to localStorage
}
```

---

## 4. Backend — New API Endpoints (v2)

### 4.1 `POST /api/compare/verdict`

**Purpose:** Generate an AI-written recommendation choosing between compared destinations.

**Request body:**
```json
{
  "destinations": [
    { "id": "coorg", "name": "Coorg", "costBreakdown": {...}, "timingInsight": {...}, "matchScore": 87 },
    { "id": "goa",   "name": "Goa",   "costBreakdown": {...}, "timingInsight": {...}, "matchScore": 74 }
  ],
  "userMood": "romantic_escape",
  "budgetRange": "5k_10k"
}
```

**Response:** Server-sent events (SSE) streaming the verdict text string.

---

### 4.2 `POST /api/chat/message`

**Purpose:** Process a user chat message and return a streamed AI reply with optional destination card metadata.

**Request body:**
```json
{
  "sessionId": "uuid-v4",
  "messages": [
    { "role": "user", "content": "Is Coorg good in July?" }
  ],
  "context": {
    "selectedMood": "need_a_reset",
    "budgetRange": "5k_10k",
    "shortlist": ["coorg", "pondy"],
    "activeScreen": "trip_detail",
    "activeTripId": "coorg"
  }
}
```

**Response:** SSE stream of text tokens. Final event includes optional:
```json
{
  "type": "destination_card",
  "destinationId": "coorg"
}
```

---

### 4.3 `POST /api/itinerary/generate`

**Purpose:** Generate a full day-by-day itinerary from user inputs.

**Request body:**
```json
{
  "destination": "Coorg",
  "startDate": "2026-07-04",
  "endDate": "2026-07-06",
  "partyType": "couple",
  "budgetPerPerson": "5k_10k",
  "interests": ["nature", "food_cafes"],
  "dietaryPreference": "veg",
  "pace": "moderate"
}
```

**Response:** SSE stream of itinerary JSON chunks (day by day):
```json
{
  "day": 1,
  "date": "2026-07-04",
  "slots": {
    "morning": { "activity": "Abbey Falls hike", "venue": "Abbey Falls", "duration": "2h", "cost": "₹0", "reason": "Best visited early to avoid weekend crowd." },
    "afternoon": { "activity": "Lunch at Coorg Cuisine", "venue": "Hotel Coorg International", "duration": "1h", "cost": "₹400–600/person", "reason": "Authentic Kodava food, strong veg menu." },
    "evening": { "activity": "Estate sunset walk", "venue": "Orange County Resort", "duration": "1.5h", "cost": "₹0", "reason": "Romantic, low effort, no booking needed." }
  },
  "estimatedDayCost": "₹800–1200"
}
```

---

### 4.4 `POST /api/itinerary/regenerate-day`

**Purpose:** Regenerate a single day of an existing itinerary.

**Request body:**
```json
{
  "itineraryId": "saved-uuid",
  "dayNumber": 2,
  "originalInputs": { ... },
  "alreadyGeneratedDays": [{ "day": 1, ... }]
}
```

**Response:** SSE stream of the regenerated day JSON.

---

## 5. Data Models (v2 additions)

```ts
// New in v2
interface SavedItinerary {
  id: string
  destination: string
  startDate: string
  endDate: string
  partyType: 'single' | 'couple' | 'friends' | 'family'
  budgetPerPerson: BudgetRange
  interests: Interest[]
  dietaryPreference: 'veg' | 'non_veg' | 'both'
  pace: 'relaxed' | 'moderate' | 'packed'
  days: ItineraryDay[]
  generatedAt: string
}

interface ItineraryDay {
  day: number
  date: string
  slots: {
    morning: ActivitySlot
    afternoon: ActivitySlot
    evening: ActivitySlot
  }
  estimatedDayCost: string
}

interface ActivitySlot {
  activity: string
  venue: string
  duration: string
  cost: string
  reason: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  linkedDestinationId?: string  // if AI suggests a destination from catalog
}

interface ChatSession {
  id: string
  messages: ChatMessage[]
  context: ChatContext
}

interface ChatContext {
  selectedMood: string | null
  budgetRange: string | null
  shortlist: string[]
  activeScreen: string
  activeTripId?: string
}

type Interest = 'food_cafes' | 'nature' | 'history' | 'nightlife' | 'adventure' | 'spiritual' | 'shopping'
```

---

## 6. Gemini Prompt Architecture (v2)

Each feature calls Gemini via the BFF with a structured system prompt. Prompt files live in `/server/prompts/`.

```
/server/prompts/
  compare.prompt.ts      — System prompt for verdict generation
  chat.prompt.ts         — System prompt for chatbot (travel domain, disclaimer)
  itinerary.prompt.ts    — System prompt for itinerary generation
```

The chat system prompt explicitly includes:
- Domain scope: India travel only
- Price disclaimer: "Always clarify prices are estimates"
- Safety: "Do not provide booking confirmations or guarantee prices"
- Context injection: mood, shortlist, active trip

---

## 7. SQLite Schema (v2 additions)

```sql
-- Itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'local',
  destination TEXT NOT NULL,
  inputs_json TEXT NOT NULL,   -- serialized ItineraryInputs
  days_json TEXT NOT NULL,     -- serialized ItineraryDay[]
  generated_at TEXT NOT NULL
);

-- Chat sessions (optional persistence)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  messages_json TEXT NOT NULL,
  context_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 8. Streaming Strategy

All AI-heavy endpoints use **Server-Sent Events (SSE)** to stream tokens to the client:

- Backend: `res.setHeader('Content-Type', 'text/event-stream')` + Gemini `generateContentStream`
- Frontend: `EventSource` or `fetch` with `ReadableStream` reader
- Skeleton UI renders immediately; content fills in as tokens arrive

---

## 9. Security & Environment

- All Gemini calls remain **server-side only** (BFF proxy)
- `GEMINI_API_KEY` stays in `.env` (never in `vite.config.ts` client bundle)
- No auth in v2; `user_id` defaults to `'local'` for all DB writes
- CORS configured to allow only Vite dev origin in development

---

## 10. Tech Stack Delta (v1 → v2)

| Layer | v1 | v2 Addition |
|-------|----|-------------|
| Frontend state | AppContext | `compareSelection`, `chatOpen`, `savedItineraries` |
| New routes | — | `/itinerary/new`, `/itinerary/:id` |
| New UI patterns | — | SSE streaming hook, bottom sheet panel, multi-step form |
| New backend endpoints | 4 | +4 (compare verdict, chat, itinerary generate, regenerate-day) |
| New DB tables | 3 | +2 (itineraries, chat_sessions) |
| New npm packages | — | None required; uses existing `@google/genai`, `express`, `better-sqlite3` |
