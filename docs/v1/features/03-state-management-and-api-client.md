# Phase 3: Frontend State Management & API Client

Wire up the React frontend to the Express backend with typed API calls and global state.

---

## Task List

### API Client — `src/lib/api.ts` [NEW]

- [ ] Create typed fetch wrapper for `getRecommendations(mood, budget?, tradeOff?)`
- [ ] Create typed fetch wrapper for `getTripDetails(id, tradeOff?)`
- [ ] Create typed fetch wrapper for `getShortlist()`
- [ ] Create typed fetch wrapper for `saveToShortlist(id)`
- [ ] Create typed fetch wrapper for `removeFromShortlist(id)`
- [ ] Create typed fetch wrapper for `getProfile()`
- [ ] Create typed fetch wrapper for `updateProfile(prefs)`
- [ ] Add base error handling (network errors, non-OK responses)

### App Context — `src/state/AppContext.tsx` [NEW]

- [ ] Create `AppContext` React Context provider
- [ ] Add `shortlist: TripRecommendation[]` state
- [ ] Add `profile: UserPreferences` state
- [ ] Add `selectedMood: Mood | null` state
- [ ] Add `selectedBudget: BudgetRange | null` state
- [ ] Implement `saveTripToShortlist` action (calls API + updates state)
- [ ] Implement `removeTripFromShortlist` action
- [ ] Implement `updateProfile` action
- [ ] Implement `setMood` and `setBudgetRange` actions
- [ ] Wrap `App.tsx` with `AppProvider` [MODIFY `src/App.tsx`]
- [ ] Persist state via backend API calls and cache in memory

---

## Dependencies

- Phase 1 (types)
- Phase 2 (backend API endpoints)

## Outputs

- `src/lib/api.ts`
- `src/state/AppContext.tsx`
- Modified `src/App.tsx`
