# Task: Integrate Gemini API for Dynamic Destination Recommendations

**Feature Area:** Mood-Based Discovery
**Status:** Todo
**Priority:** Critical

## Description
Implement the core decision engine using the Gemini API. Instead of hardcoding predefined destination clusters, the application should dynamically generate personalized destination recommendations based on the user's selected mood, incorporating seasonal context.

## Acceptance Criteria
- [ ] Setup a service to handle Gemini API requests securely (using the API key from `.env`).
- [ ] Create a robust prompt for the Gemini API that includes the user's selected mood, current season/month, and requires structured output (JSON).
- [ ] Define the expected data structures for the API response to map easily to the "Smart Destination Cards" component.
- [ ] Implement error handling and fallback mechanisms if the API request fails.
- [ ] Ensure the generation logic provides recommendations matched with the weather/season suitability.
