# TailorTrip

An AI-powered smart travel optimizer. Don't just book. Optimize.

Start with a mood, see where your money goes furthest, and travel when it is calm
and cheap. TailorTrip helps you decide *where*, *when*, and *whether it fits your
budget* before you book — then hands you a day-by-day AI itinerary.

## Stack

- **Frontend:** React 19 + Vite + TypeScript, Tailwind CSS v4, React Router
- **Backend:** Express BFF (`/api`) — keeps the Gemini key server-side
- **Data & Auth:** Supabase (Postgres + Auth: Google + email/password)
- **AI:** Google Gemini

Every AI and data surface has a graceful fallback, so the app runs and is
testable with **zero keys configured**. It goes fully live when real keys are
added to `.env`.

## Getting started

```bash
npm install
cp .env.example .env   # optional — fill in keys to go live; omit to use fallbacks
npm run dev:all        # web on :3000, API on :3001
```

- `npm run dev` — frontend only
- `npm run server` — API only
- `npm run build` — production build of the SPA
- `npm run lint` — TypeScript type-check
- `npm start` — serve the built SPA + API (used on Render)

## Design system

Quiet Luxury: bone-white canvas, deep-ink text, one restrained deep-green accent,
hairline borders, editorial serif headings (Libre Caslon Text) paired with a clean
sans UI (Inter), tabular figures for prices, uppercase micro-labels. Tokens live in
`src/index.css`.
