# Task: Build Destination Cards List & Integration

**Feature Area:** Smart Destination Cards
**Status:** Todo
**Priority:** High

## Description
Wire up the full Smart Destination Cards experience by rendering a list of `DestinationCard` components on the Explore page, fed by the Gemini API recommendations. This includes loading/error states, empty states, and staggered entry animations.

## Acceptance Criteria
- [ ] Render a vertical list of `DestinationCard` components on the Explore page.
- [ ] Source card data from the `MoodContext` recommendations (Gemini API response).
- [ ] Show a skeleton/shimmer loading state while recommendations are being fetched.
- [ ] Display an empty state with a prompt to select a mood if no recommendations exist.
- [ ] Show an error state with a retry button if the API call fails.
- [ ] Add staggered fade-in animations as cards enter the viewport.
- [ ] Ensure the list is scrollable and performs well with multiple cards.
