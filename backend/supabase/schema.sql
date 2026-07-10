-- ╔══════════════════════════════════════════════════════════╗
-- ║               TailorTrip — Supabase schema                ║
-- ║  Run this once in the Supabase SQL editor. Safe to re-run  ║
-- ║  after edits — every statement is idempotent.              ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- Auth is handled by Supabase Auth (Google + email/password), so no users
-- table is needed here. Shortlist and saved itineraries are real, per-user
-- tables below, keyed to auth.users. The BFF (Express server) is the only
-- thing that ever talks to this database — it uses the service role key,
-- which bypasses row level security entirely. The RLS policies below are
-- defense-in-depth, not the actual access control: the real security
-- boundary is the server manually filtering every query by the
-- authenticated request's user id (see server/routes/shortlist.ts and
-- server/routes/itineraries.ts). They only start to matter if a future
-- change ever adds direct client-side Supabase access.

create table if not exists analytics_events (
  id          bigint generated always as identity primary key,
  event_type  text not null,
  event_data  text,                 -- JSON payload
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_type_idx on analytics_events (event_type);
create index if not exists analytics_events_created_idx on analytics_events (created_at);

-- ─── Shortlist ────────────────────────────────────────────────────────

create table if not exists shortlist_items (
  user_id         uuid not null references auth.users(id) on delete cascade,
  destination_id  text not null,
  created_at      timestamptz not null default now(),
  primary key (user_id, destination_id)
);

alter table shortlist_items enable row level security;

drop policy if exists "select own shortlist" on shortlist_items;
create policy "select own shortlist" on shortlist_items for select using (auth.uid() = user_id);

drop policy if exists "insert own shortlist" on shortlist_items;
create policy "insert own shortlist" on shortlist_items for insert with check (auth.uid() = user_id);

drop policy if exists "delete own shortlist" on shortlist_items;
create policy "delete own shortlist" on shortlist_items for delete using (auth.uid() = user_id);

-- ─── Saved itineraries ────────────────────────────────────────────────

create table if not exists itineraries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  inputs        jsonb not null,
  days          jsonb not null,
  generated_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table itineraries enable row level security;

drop policy if exists "select own itineraries" on itineraries;
create policy "select own itineraries" on itineraries for select using (auth.uid() = user_id);

drop policy if exists "insert own itineraries" on itineraries;
create policy "insert own itineraries" on itineraries for insert with check (auth.uid() = user_id);

create index if not exists itineraries_user_idx on itineraries (user_id);

-- ─── AI-generated destination cache ────────────────────────────────────
-- Durable by-id lookup for AI-generated destinations (server/lib/destinationPool.ts).
-- Not user-scoped data — a destination a user shortlisted must stay resolvable
-- for as long as that shortlist_items row exists, well past any in-memory
-- cache TTL or a Render free-tier dyno idling out. No policies: only the
-- service-role server ever touches this table.

create table if not exists generated_destinations (
  id              text primary key,
  data            jsonb not null,
  schema_version  int not null default 1,
  created_at      timestamptz not null default now()
);

alter table generated_destinations enable row level security;

-- ─── Profile preferences ────────────────────────────────────────────────
-- Display name and avatar stay in auth.users (Supabase Auth), updated via
-- the admin API — this table is only for preferences that have nowhere else
-- to live: home base and defaults that personalize recommendations.

create table if not exists user_profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  home_city         text,
  home_state        text,
  preferred_moods   text[] not null default '{}',
  default_budget_id text,
  updated_at        timestamptz not null default now()
);

alter table user_profiles enable row level security;

drop policy if exists "select own profile" on user_profiles;
create policy "select own profile" on user_profiles for select using (auth.uid() = user_id);

drop policy if exists "upsert own profile" on user_profiles;
create policy "upsert own profile" on user_profiles for insert with check (auth.uid() = user_id);

drop policy if exists "update own profile" on user_profiles;
create policy "update own profile" on user_profiles for update using (auth.uid() = user_id);
