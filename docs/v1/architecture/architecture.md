# TailorTrip Architecture

## 1) System Overview

TailorTrip is currently a **single-page React application** built with **Vite + TypeScript + Tailwind CSS v4**.

- Runtime: Browser (client-side rendering)
- Routing: `react-router-dom` (BrowserRouter)
- Styling: Tailwind utility classes + `src/index.css` theme tokens
- State: Local component state (`useState`) only
- Data source: Hardcoded mock data inside page components

There is **no active backend integration** in the current codebase, even though backend/AI packages are present in `package.json`.

## 2) High-Level Architecture

```text
Browser
  -> Vite-bundled React SPA
      -> App.tsx (route table)
          -> Layout.tsx (shared shell: header/footer)
              -> Page components (Home, Explore, TripDetails, etc.)
                  -> Local UI state + inline mock data
```

## 3) Frontend Structure

### Entry and Bootstrapping

- `src/main.tsx`
  - Mounts `<App />` in React StrictMode.
- `src/App.tsx`
  - Declares all routes and wraps them with shared `Layout`.

### Shared Layout

- `src/components/Layout.tsx`
  - Global header, search box (visual only), nav links, footer.
  - Uses `useLocation` to adjust header style on homepage.

### Route Map

- `/` -> `Home`
- `/explore` -> `Explore`
- `/trip/:id` -> `TripDetails`
- `/shortlist` -> `Shortlist`
- `/compare` -> `Compare`
- `/profile` -> `Profile`
- `/no-results` -> `NoResults`

### UI Theme Layer

- `src/index.css`
  - Tailwind import + custom theme tokens (`--color-primary`, `--color-background-light`, etc.).
  - Utility helper: `.hide-scroll`.

## 4) Current Data & State Flow

The app is mostly static UX scaffolding:

- Lists/cards are hardcoded directly in page files.
- `useState` controls local toggles only:
  - Expand/collapse card reasons in `Explore`
  - Tab switching in `TripDetails`
  - Profile sidebar tab state in `Profile`
- `useParams()` is used in `TripDetails`, but the `id` is not currently used to fetch or derive trip-specific data.
- Cross-page persistence (saved trips, profile settings, filters) is not implemented.

## 5) Build and Environment

### Tooling

- Build/dev server: Vite
- Script commands (from `package.json`):
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
  - `npm run lint` (`tsc --noEmit`)

### Vite Config Notes

- `vite.config.ts` injects `process.env.GEMINI_API_KEY` from environment using `loadEnv`.
- Alias `@` points to project root.
- HMR toggled by `DISABLE_HMR`.

## 6) External Dependencies: Used vs Present

### Actively used in source

- `react`, `react-dom`
- `react-router-dom`
- `lucide-react`
- `@tailwindcss/vite`, `tailwindcss`

### Installed but not yet used in `src/`

- `@google/genai`
- `express`
- `better-sqlite3`
- `dotenv`

This indicates intended future backend/AI capabilities that are not yet implemented.

## 7) Gaps / Risks in Current Architecture

- No API/data layer abstraction (all page-level mock data).
- No domain models/types for trips, budgets, comparisons.
- No centralized state management for shortlist/profile preferences.
- No persistence (local DB, localStorage, or server).
- No error/loading states for async flows because no async fetch layer exists yet.
- Potential secret-exposure risk if API key is used directly in frontend.

## 8) Recommended Target Architecture (Next Iteration)

```text
React Client (UI + Router)
  -> API Client Layer (/src/lib/api)
      -> Express BFF (/server)
          -> AI Provider (Gemini)
          -> SQLite (better-sqlite3) for cached trips, user prefs, shortlist
```

### Suggested module split

- `/src/types` -> Trip, CostBreakdown, Preference, Recommendation models
- `/src/lib/api` -> fetch wrappers and endpoint functions
- `/src/state` -> shortlist/profile/filter state (Context or lightweight store)
- `/server` -> Express routes + service layer + DB adapter

### Suggested API surface (MVP)

- `POST /api/recommendations` (mood + budget + constraints -> trip cards)
- `GET /api/trips/:id` (detail dashboard data)
- `GET/POST /api/shortlist`
- `GET/POST /api/profile/preferences`

## 9) Immediate Action Plan

1. Introduce typed mock data modules (remove inline page literals).
2. Add a shared API client interface with mocked implementations.
3. Stand up minimal Express server in `/server` and proxy via Vite.
4. Move shortlist/profile state into centralized store and persist.
5. Integrate AI recommendation call on backend only (not browser direct).

