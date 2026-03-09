# TailorTrip - MVP High-Level Features

This document outlines the high-level features for the **TailorTrip Minimum Viable Product (MVP)**, extracted from the comprehensive PRD. The MVP focuses on serving as an AI-powered, mood-driven travel decision engine.

## 1. Mood-Based Discovery
The entry point of the application, designed to reduce starting friction by allowing users to explore destinations based on their current mood.
- **Entry Screen:** Asks users "How do you want to feel?"
- **Mood Cards:** Scrollable options like *Need a reset*, *Adventure mode*, *Budget weekend*, *Romantic escape*, *Workation vibe*, *Explore something new*.
- **Interaction:** Tapping a mood instantly generates personalized destination recommendations without requiring a mandatory login.
- **Data Logic:** Maps moods to predefined destination clusters with seasonal logic applied.

## 2. Smart Destination Cards
Curated destination recommendations that provide an immediate layer of clarity and context.
- **Visuals & Identity:** Includes destination name and a hero image.
- **Cost & Clarity:** Estimated total trip cost (range) and the cheapest month indicator.
- **Contextual Badges:** Crowd level (Low / Medium / High) and Weather badge (Pleasant / Hot / Rainy).
- **Personalized Explanation:** An expandable "Why this fits you" section (e.g., "Recommended because it's affordable in July, low crowd season, and matches your weekend duration.").
- **View States:** Default, Expanded, and Saved states.

## 3. Optimization Dashboard (Destination Detail)
A comprehensive view for a selected destination that helps the user make an optimized travel decision.
- **Trip Snapshot:** Total estimated cost and duration assumption (e.g., 2-3 days).
- **Cost Breakdown:** Travel, Stay, Food & experiences, and Per-person estimates.
- **Timing Insights:** Cheapest month graph, Crowd calendar (color-coded), and Weather pattern.
- **Trade-Off Toggle:** Views for *Cheapest*, *Least crowded*, and *Balanced*.
- **Budget Fit Meter:** Optional salary input to show affordability (e.g., "This trip is approx 18% of your monthly income.").
- **Action Items (CTA):** Save, Compare later, and View booking options.

## 4. Save & Shortlist
Allows users to curate their own list of potential travel plans.
- **Save Functionality:** Users can save destinations locally.
- **Saved Tab:** A dedicated tab to view all shortlisted trips.
- **Management:** Ability to remove saved items from the list.

## 5. Outbound Booking
The final hand-off from TailorTrip to the booking stage.
- **Redirection:** Redirect users to a partner Online Travel Agency (OTA).
- **Analytics:** Track outbound click events to measure MVP success.
- **Transparency:** Display a disclaimer stating "Prices may vary".

---

## Out of Scope for MVP
The following features are explicitly omitted from the MVP to keep the focus tight on the core value proposition (the discovery and decision engine):
- Direct booking
- Expense splitting
- Collaborative trip rooms
- Full itinerary builder
- Loyalty & gamification
