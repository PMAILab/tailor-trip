-- ╔══════════════════════════════════════════════════════════╗
-- ║               TailorTrip — Supabase schema                ║
-- ║  Run this once in the Supabase SQL editor.                ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- Auth is handled by Supabase Auth (Google + email/password), so no users
-- table is needed here. Shortlist and saved itineraries live in the browser
-- for the MVP. The only server-persisted data is the analytics event log,
-- which the BFF writes to on a best-effort basis.

create table if not exists analytics_events (
  id          bigint generated always as identity primary key,
  event_type  text not null,
  event_data  text,                 -- JSON payload
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_type_idx on analytics_events (event_type);
create index if not exists analytics_events_created_idx on analytics_events (created_at);

-- The service role key (server-side only) bypasses row level security, so no
-- policies are required for the BFF to insert. Do not expose that key to the
-- browser; the client uses the anon key for auth only.
