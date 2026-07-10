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

## Structure

Split into two independently deployable apps, each with its own `package.json`:

- `frontend/` — React 19 + Vite SPA, deployed to Netlify
- `backend/` — Express BFF, compiled with `tsc`, deployed to Render
  (`backend/supabase/schema.sql` is the DB schema)

The root `package.json` is dev-orchestration only (runs both together) — it
is not deployed.

## Getting started

```bash
npm run install:all        # installs frontend/ and backend/ separately
cp backend/.env.example backend/.env    # fill in keys to go live; omit to use fallbacks
cp frontend/.env.example frontend/.env  # optional, only VITE_TRAVELPAYOUTS_MARKER
npm run dev:all            # web on :3000, API on :3002
```

- `npm run dev` — frontend only (Vite on :3000)
- `npm run server` — API only (Express on :3002, via `tsx watch`)
- `npm run build` — production build of the SPA (`frontend/dist`)
- `npm run lint` — lints frontend (oxlint) and typechecks backend

The Vite dev server proxies `/api` to the Express BFF, so the two run side by
side in development. In production they're separate services — see below.

## Deploy (split: Netlify + Render)

- **Frontend (Netlify):** `netlify.toml` builds `frontend/` and publishes
  `frontend/dist`. Set `VITE_TRAVELPAYOUTS_MARKER` in Netlify's dashboard
  before the first build. Leave `VITE_API_URL` unset — Netlify proxies
  `/api/*` to the Render backend server-to-server (see the redirect in
  `netlify.toml`), keeping the session cookie first-party.
- **Backend (Render):** `render.yaml` blueprint, rooted at `backend/`.
  Builds with `npm install && npm run build` (`tsc` to `backend/dist`) and
  starts with `node dist/index.js`. Set the environment variables from
  `backend/.env.example` in the Render dashboard. Render injects `PORT`
  automatically.

Both files carry detailed comments on why the split exists (third-party
cookie blocking breaks a direct cross-origin setup).

## Database (Supabase)

This Supabase project hosts multiple MVPs side by side, one Postgres schema
per app — TailorTrip's tables live in the `tailortrip` schema, not `public`.
Run `backend/supabase/schema.sql` in the Supabase SQL editor (it drops and
rebuilds the `tailortrip` schema fresh, idempotent, safe to re-run), then add
`tailortrip` under Project Settings → API → Data API Settings → Exposed
schemas.

## Design system

Quiet Luxury: bone-white canvas, deep-ink text, one restrained deep-green accent,
hairline borders, editorial serif headings (Libre Caslon Text) paired with a clean
sans UI (Inter), tabular figures for prices, uppercase micro-labels. Tokens live in
`frontend/src/index.css`.
