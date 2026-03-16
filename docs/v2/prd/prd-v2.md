# TailorTrip — PRD v2

**Version:** 2.0  
**Status:** Draft  
**Date:** March 2026  
**Audience:** Product, Design, Engineering

---

## 1. Overview

TailorTrip v2 builds on the Mood-Based Discovery, Smart Destination Cards, Optimization Dashboard, Shortlist/Save, and Outbound Booking foundation shipped in v1.

The three priority features for v2 are:

| # | Feature | One-line Description |
|---|---------|----------------------|
| 1 | **Compare Trips** | Side-by-side comparison of 2–3 saved destinations across cost, timing, and trade-offs |
| 2 | **AI Travel Chatbot** | Conversational assistant that answers trip-planning questions in plain language |
| 3 | **AI-Generated Itinerary** | Day-by-day, personalized itinerary built from user-provided inputs via a guided form |

These features deepen the value of TailorTrip's core promise: _help users feel confident before booking_ — by adding comparison clarity, on-demand guidance, and concrete daily plans.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Increase shortlist-to-decision conversion | % of shortlisted users who use Compare | ≥ 40% |
| Drive engagement depth | Avg. messages per chatbot session | ≥ 4 |
| Increase pre-booking confidence | Itinerary download / share rate | ≥ 30% of users who generate one |
| Reduce drop-off on trip detail pages | Time spent on TripDetails after v2 launch | +25% |

---

## 3. User Personas (unchanged from v1)

- **Priya, 26, Bangalore** — works in tech, solo traveller, budget-conscious, overwhelmed by OTA clutter
- **Rohan, 29, Mumbai** — couple trip planner, wants value for money, 3-day weekend escapes
- **Anika, 24, Delhi** — first big trip planner, needs hand-holding and structured guidance

---

## 4. Feature Specifications

---

### 4.1 Compare Trips

#### 4.1.1 User Problem
Users shortlist 2–4 destinations but have no structured way to pick between them. They switch tabs mentally or re-read cards. This leads to indecision and drop-off.

#### 4.1.2 Solution
A dedicated **Compare screen** (route: `/compare`) that renders saved destinations in a structured, scrollable side-by-side grid. Each dimension (cost, timing, crowd, weather) is a row; each destination is a column. Tradeoff highlights auto-call out the winner per dimension.

#### 4.1.3 Entry Points
- "Compare" button on the Shortlist screen (active after ≥ 2 trips saved)
- "Compare Later" button on the TripDetails screen (now enabled — was disabled in v1 MVP)
- A persistent Compare FAB (Floating Action Button) on the Explore feed when ≥ 2 trips are saved

#### 4.1.4 Functional Requirements

**FR-C1** — The user can select 2 or 3 destinations from their shortlist to compare.  
**FR-C2** — The comparison grid shows the following rows:

| Row | Data |
|-----|------|
| Hero image + name | Destination card header |
| Estimated Total Cost | ₹ range |
| Cost Breakdown | Travel / Stay / Food (bar visual) |
| Cheapest Month | Badge |
| Crowd Level | Low / Med / High pill |
| Weather | Pleasant / Hot / Rainy |
| Duration | Days |
| AI Match Score | % match to user's selected mood |
| AI Verdict | 1-line reason for or against |

**FR-C3** — Each row highlights the "best" value in green (e.g., lowest cost, lowest crowd).  
**FR-C4** — A final "AI Recommendation" card at the bottom gives a 2–3 sentence recommendation on which trip to pick and why, generated via Gemini.  
**FR-C5** — Users can swap out one destination (tap to replace from shortlist).  
**FR-C6** — "Book This Trip" button under each column links to outbound booking for that destination.

#### 4.1.5 Non-Functional
- Compare grid renders within 500ms (local data + one AI call)
- AI Recommendation text streams (shows typing indicator)
- Accessible: columns are scrollable horizontally on small screens

#### 4.1.6 Out of Scope (v2)
- Comparing trips across different users / sharing compare view
- Flight price real-time lookup

---

### 4.2 AI Travel Chatbot

#### 4.2.1 User Problem
Users have specific, situational questions ("Is Coorg good in July?", "What's the cheapest option under ₹8K?") that no static UI can answer. They currently leave the app and Google it.

#### 4.2.2 Solution
A conversational AI assistant powered by Gemini, accessible via a **chat bubble FAB** visible across all screens. The chatbot is travel-domain-aware and has context of the user's current mood selection, shortlist, and any active trip view.

#### 4.2.3 Entry Points
- Floating chat bubble (bottom-right) on every screen except splash
- "Ask AI" link inside TripDetails and Compare screens

#### 4.2.4 Functional Requirements

**FR-CH1** — Chat UI opens as a bottom sheet / slide-up panel (does not navigate away from current screen).  
**FR-CH2** — Chatbot is initialized with a system prompt that includes:
- User's selected mood
- User's budget range
- Destinations in shortlist (names + cost estimates)
- Current screen context (e.g., "User is viewing Coorg trip detail")

**FR-CH3** — Supported query types:

| Type | Example |
|------|---------|
| Season / timing | "When is the best time to visit Ladakh?" |
| Budget | "Which shortlisted trip is cheapest?" |
| Crowd | "Where will it be least crowded in October?" |
| Comparison | "Between Goa and Coorg, which is better for couples?" |
| Itinerary hint | "Give me a 2-day plan for Pondicherry" |
| General | "How do I book a bus to Manali?" |

**FR-CH4** — Responses are streamed (word-by-word) to feel fast.  
**FR-CH5** — Chat history persists for the session (not across app restarts in v2).  
**FR-CH6** — Chatbot has a predefined set of **quick reply chips** on open:
- "What's cheap right now?"
- "Help me pick a trip"
- "Plan my weekend"

**FR-CH7** — If the chatbot output recommends a destination that is in the app's data catalog, it renders a mini destination card inline (tap → opens TripDetails).  
**FR-CH8** — Chatbot explicitly avoids giving booking confirmations or price guarantees.

#### 4.2.5 Non-Functional
- First response token visible within 1.5s
- Chat panel scroll-locks body when open
- Error state: "Hmm, I couldn't connect. Tap to retry."

#### 4.2.6 Out of Scope (v2)
- Voice input
- Cross-session conversation history
- Human handoff / live agent

---

### 4.3 AI-Generated Itinerary

#### 4.3.1 User Problem
Users know where they want to go but don't know what to do each day. Planning a 3-day trip from scratch is daunting. They download itineraries from blogs, which are generic and dated.

#### 4.3.2 Solution
A guided **Itinerary Builder** flow that collects user inputs (destination, dates, party type, budget bucket, interests) and generates a structured, personalized day-by-day itinerary using Gemini.

#### 4.3.3 Entry Points
- "Generate Itinerary" button on TripDetails screen
- Shortlist screen: "Plan this trip" action per saved destination

#### 4.3.4 Input Collection — Guided Form (`/itinerary/new`)

| Step | Field | Input Type |
|------|-------|-----------|
| 1 | Destination | Pre-filled from TripDetails (editable) |
| 2 | Travel Dates | Date range picker (from / to) |
| 3 | Party Type | Single / Couple / Friends / Family (pill select) |
| 4 | Budget per person | ₹ bucket select (matches app budget ranges) |
| 5 | Interests | Multi-select chips: Food & Cafes, Nature, History, Nightlife, Adventure, Spiritual, Shopping |
| 6 | Dietary Preference | Veg / Non-Veg / Both (optional) |
| 7 | Pace | Relaxed / Moderate / Packed |

The form is **2-screen max**: Steps 1–4 on screen 1, steps 5–7 on screen 2. A "Generate Itinerary" CTA button is always visible.

#### 4.3.5 Functional Requirements

**FR-I1** — The form pre-fills destination from context (TripDetails or Shortlist tap).  
**FR-I2** — All fields have sensible defaults so the user can tap Generate immediately.  
**FR-I3** — On submit, a prompt is constructed from the inputs and sent to Gemini via the backend BFF.  
**FR-I4** — The itinerary is structured as:

```
Day 1
  Morning: [Activity + place + why]
  Afternoon: [Activity + place + why]
  Evening: [Activity + place + why]
  Estimated Day Cost: ₹X–Y

Day 2 ...
```

**FR-I5** — Each activity card shows:
- Activity name + venue name
- Estimated duration
- Cost (if applicable)
- 1-line AI rationale ("Great for couples, less touristy in the morning")

**FR-I6** — User can **regenerate** any single day by tapping a "Refresh Day" icon.  
**FR-I7** — User can **edit** activity names / notes inline (plain text override).  
**FR-I8** — Itinerary is **saveable** to the user's profile (localStorage in v2, server-side in v3).  
**FR-I9** — Itinerary can be **shared** via a generated plain-text export (copy to clipboard).

#### 4.3.6 Non-Functional
- Full itinerary generation completes within 8 seconds
- Shows a streaming skeleton (day by day) rather than a full loading spinner
- Graceful fallback: if Gemini returns partial content, render what's available

#### 4.3.7 Out of Scope (v2)
- PDF export
- Hotel / flight booking within itinerary
- Real-time restaurant reservation integration

---

## 5. UX Principles (unchanged from v1)

- Max 3 major actions per screen
- Primary CTA always visible
- No dark patterns
- Transparent cost labeling
- Minimal onboarding friction

---

## 6. Dependency Map

```
v1 Complete
  ↓
Compare Trips         ← Depends on: Shortlist (v1), TripRecommendation types (v1)
AI Chatbot            ← Depends on: AppContext (v1), Gemini BFF (v1 backend)
AI Itinerary          ← Depends on: TripDetails (v1), Gemini BFF (v1 backend)
```

All three v2 features depend on the v1 backend BFF and Gemini integration being live.

---

## 7. Constraints

- Gemini API key must stay server-side (BFF proxy, not browser-direct)
- No authentication in v2 — user data stored in localStorage only
- Budget ranges and destination data remain the same catalog as v1
- Mobile-first (iPhone 14 Pro reference frame)

---

## 8. Risks

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Gemini latency > 3s on itinerary gen | Medium | Stream response; show day-by-day skeleton |
| Chatbot hallucinations on prices / bookings | High | Explicit system prompt guardrails; disclaimer banner |
| Compare grid too wide on small screens | Medium | Horizontal scroll + sticky row labels |
| Users skip input form, get generic itinerary | Low | Smart defaults + easy regenerate |

---

## 9. Open Questions

1. Should Compare screen also be accessible for un-saved (freshly viewed) trips — or shortlist-only?
2. Should chat history persist to localStorage between sessions in v2 or wait for v3 auth?
3. Itinerary: should "Refresh Day" re-call Gemini for that day only, or regenerate the full itinerary?
