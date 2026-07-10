# TailorTrip, Claude Code Build Prompt

Paste everything below into Claude Code inside the TailorTrip repo. It is written to make Claude Code ask questions before building, so there are fewer bugs and less rework.

---

You are my senior full stack engineer building **TailorTrip**, an AI powered smart travel optimizer. This is a responsive website with login. I have the product spec, the visual designs (in Stitch, connected to you), and an existing codebase. Your job is to build the product to a finished, demo ready state against the designs and the PRD.

**Do not start coding yet. First read the context, then ask me your questions, then propose a short plan and wait for my go ahead.** I would rather answer ten questions now than fix ten bugs later.

## Ways of working (important)

1. Work on a **new branch called `feature/aayush`**, created from the current main branch. This is a team repo, so never commit to main or to anyone else's branch. Confirm the branch is created before your first commit.
2. Before writing code, ask me every clarifying question you have. Group them so I can answer in one pass. If something is ambiguous mid build, stop and ask rather than guessing.
3. After my answers, give me a short build plan (phases and what each delivers) and wait for my approval.
4. Build in small, reviewable increments. Commit often with clear messages. After each meaningful chunk, tell me what you did and what is next.
5. Never hardcode secrets. All keys (Supabase, Gemini) come from environment variables and a `.env` that is gitignored. Use the existing `.env.example` as the template.
6. Keep the app building and lint clean at every step. Run the build and type check before you say something is done.
7. If you change the plan or discover the spec is wrong, tell me and pause.

## Context to read first

- **Product spec:** the TailorTrip PRD (I will place `TailorTrip_PRD.docx` in the repo `docs/` folder, or paste it if you cannot read it). It defines the problem, users, features, scope, North Star, and analytics.
- **Designs:** the Stitch designs are connected to you. Match them closely. The visual system is quiet luxury and minimal: bone white background, deep ink text, one restrained deep green accent, hairline borders instead of heavy shadows, an editorial serif for headings paired with a clean sans for interface, tabular figures for prices, uppercase micro labels, and lots of white space.
- **Existing code:** the repo already has a working React 19 plus Vite frontend, an Express BFF exposing `/api`, a Supabase data layer, and a Gemini integration, and it currently builds and lints cleanly. Prefer to reuse and refactor this foundation rather than rebuild from zero, unless you find a strong reason to start fresh. Confirm this approach with me.

## What the product must do (scope)

Discovery is open to everyone. Saving, comparing, and generating an itinerary require login.

1. **Landing page (public):** editorial hero, "Start with a mood" primary action, and a "Log in" link.
2. **Auth:** login and sign up with Google and with email and password, using Supabase Auth. Sessions persist. A logged out user who tries a personal action sees a soft sign in modal, not a hard wall.
3. **Mood discovery (public):** pick one of 6 to 8 moods, with optional budget range and a Cheapest versus Least crowded toggle.
4. **Explore feed (public):** Smart Destination Cards showing total cost in rupees, badges (cheapest month, crowd level), and an AI "why this fits your mood" line. Save to shortlist.
5. **Trip details, decision dashboard (public to view):** cost breakdown (stay, travel, food), a cheapest versus least crowded timing toggle with a small chart, and a budget fit percentage.
6. **Shortlist (auth):** saved trips, with Compare enabled at two or more saved.
7. **Compare (auth):** two or three destinations side by side, best value per row highlighted, and an AI recommendation summary.
8. **AI itinerary (auth, the North Star):** a short guided form, then a Gemini generated day by day itinerary the user can save and share.
9. **Outbound affiliate booking:** a "Book this trip" action that deep links out via an affiliate link.
10. **Profile and account:** saved trips, preferences, connected account, log out.

## Quality bar

- Fully responsive, mobile first, clean on desktop and mobile.
- Every card, list, and AI surface has three states: loading skeleton, empty, and error. AI calls degrade gracefully with a sensible fallback so nothing ever looks broken.
- All user facing copy is human and plain spoken. **Do not use dashes (em dash, en dash, or hyphen as a pause) anywhere in the UI copy, and avoid an AI sounding tone.** Use commas, colons, or short sentences.
- Prices use the rupee symbol and tabular figures. Use real feeling Indian destinations.
- Fire the analytics events named in the PRD (signup, mood selected, card viewed, trip saved, compare opened, itinerary generated, itinerary saved or shared, outbound booking click).
- Accessible: readable contrast, keyboard friendly, horizontally scrollable compare on small screens.

## Please ask me about these before you start (at least)

1. Rebuild from scratch, or reuse and refactor the existing frontend and backend? My lean is reuse, but tell me what you would do.
2. Is the current Supabase project and schema ready to use, and do you have the URL and keys, or should the app run on in memory or seeded data for the demo?
3. Should the AI itinerary and the destination data use live sources, or the curated seed data already in the repo for now?
4. Where do the affiliate booking links come from, or should I stub them with a clear placeholder for now?
5. What is the deploy target (I plan to deploy on Render), and should you set up the build and start scripts for it?
6. Any screens in Stitch that are not final yet, so I know what to treat as source of truth?

Once I answer, propose your plan and start on the `feature/aayush` branch.
