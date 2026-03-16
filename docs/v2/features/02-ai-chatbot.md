# Feature 2 (v2): AI Travel Chatbot

Conversational assistant accessible across all screens that answers travel questions using the user's current context.

---

## Task List

### Types — `src/types/types.ts` [MODIFY]

- [ ] Add `ChatMessage` type — `id`, `role: 'user' | 'assistant'`, `content`, `timestamp`, `linkedDestinationId?`
- [ ] Add `ChatSession` type — `id`, `messages: ChatMessage[]`, `context: ChatContext`
- [ ] Add `ChatContext` type — `selectedMood`, `budgetRange`, `shortlist: string[]`, `activeScreen`, `activeTripId?`

### State — `src/state/AppContext.tsx` [MODIFY]

- [ ] Add `chatOpen: boolean` to `AppState`
- [ ] Add `toggleChat()` action
- [ ] Add `chatMessages: ChatMessage[]` to `AppState`
- [ ] Add `addChatMessage(msg: ChatMessage)` action
- [ ] Add `clearChat()` action

### Chat Feature Components — `src/features/chat/` [NEW]

- [ ] `ChatFAB.tsx`
  - [ ] Floating action button, fixed bottom-right, z-index above all content
  - [ ] Chat bubble icon; badge shows unread indicator when chat has new reply and panel is closed
  - [ ] Tap → `toggleChat()`
  - [ ] Hide on Splash screen; visible on all other routes
- [ ] `ChatPanel.tsx`
  - [ ] Bottom sheet slide-up animation (transform translateY)
  - [ ] Height: 70vh on mobile
  - [ ] Header: "TailorTrip AI" + close (×) button
  - [ ] Message list (scrollable, auto-scroll on new message)
  - [ ] Input bar at bottom: text input + send button
  - [ ] Disclaimer banner: "Prices are estimated. Not a booking service."
  - [ ] When open: body scroll locked
- [ ] `ChatMessage.tsx`
  - [ ] User message: right-aligned, primary accent bubble
  - [ ] AI message: left-aligned, light grey bubble
  - [ ] If `linkedDestinationId` present → render `<MiniDestinationCard destinationId={...} />`
- [ ] `ChatQuickReplies.tsx`
  - [ ] Shown only when `chatMessages.length === 0`
  - [ ] Chips: "What's cheap right now?", "Help me pick a trip", "Plan my weekend"
  - [ ] Tap chip → sends as first user message
- [ ] `MiniDestinationCard.tsx` [NEW — reusable]
  - [ ] Compact card: thumbnail, name, cost range, "View Details →" link

### API Client — `src/lib/api.ts` [MODIFY]

- [ ] Add `sendChatMessage(sessionId, messages, context)` — calls `POST /api/chat/message` via SSE
- [ ] Reuse `useSSEStream` hook (from Feature 1 / Compare)
- [ ] Add `buildChatContext()` helper — derives context object from current AppState

### Layout — `src/components/Layout.tsx` [MODIFY]

- [ ] Inject `<ChatFAB />` and `<ChatPanel />` inside Layout (renders on all routes)
- [ ] Pass `activeScreen` and `activeTripId` from `useLocation` / `useParams` to context

### Backend — `server/routes/chat.ts` [NEW]

- [ ] `POST /api/chat/message`
  - [ ] Validate body: `sessionId`, `messages[]`, `context`
  - [ ] Build system prompt from `server/prompts/chat.prompt.ts` with injected context
  - [ ] Append user messages to Gemini request
  - [ ] Call `gemini.generateContentStream()`
  - [ ] Parse final token for optional destination card JSON `{ type: "destination_card", destinationId }`
  - [ ] Pipe SSE response; last event includes destination card metadata if present

### Backend Prompt — `server/prompts/chat.prompt.ts` [NEW]

- [ ] Role: "friendly AI travel advisor for Indian destinations"
- [ ] Domain: India domestic travel only; defer international queries politely
- [ ] Context injection: user's mood, budget, shortlist names, active screen / trip
- [ ] Disclaimer rule: always add "(prices are estimates)" when mentioning costs
- [ ] Safety rule: never confirm a booking, never guarantee real-time prices
- [ ] Destination card trigger: if response recommends a specific destination from the catalog, append a JSON block `// DESTINATION_CARD: { "destinationId": "coorg" }` at end of response

### SQLite (optional session persistence) — `server/db.ts` [MODIFY]

- [ ] Create `chat_sessions` table on init (if not exists)
- [ ] `saveChatSession(session: ChatSession)` — upsert by session id
- [ ] Session TTL: 24 hours (cleanup cron or on-init sweep)

---

## Dependencies

- Phase 2 v1 (BFF + Gemini integration)
- Phase 3 v1 (AppContext, API client)
- Feature 1 v1 (Foundation types)
- Feature 1 v2 (useSSEStream hook)

## Outputs

- `src/types/types.ts` (modified)
- `src/state/AppContext.tsx` (modified)
- `src/features/chat/` (new folder — ChatFAB, ChatPanel, ChatMessage, ChatQuickReplies, MiniDestinationCard)
- `src/lib/api.ts` (modified)
- `src/components/Layout.tsx` (modified)
- `server/routes/chat.ts` (new)
- `server/prompts/chat.prompt.ts` (new)
- `server/db.ts` (modified — chat_sessions table)
