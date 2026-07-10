-- ╔══════════════════════════════════════════════════════════╗
-- ║               TailorTrip — Supabase schema                ║
-- ║  Run this once in the Supabase SQL editor. Safe to re-run  ║
-- ║  after edits — every statement is idempotent.              ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- Everything lives under the "tailortrip" Postgres schema, not "public" —
-- this Supabase project hosts multiple MVPs side by side, one schema each,
-- to avoid table-name collisions between them. After running this: Project
-- Settings → API → Data API Settings → "Exposed schemas", add "tailortrip"
-- (public is exposed by default, custom schemas are not) — PostgREST (and
-- therefore supabase-js) can't see a schema that isn't listed there.
--
-- Auth is handled by Supabase Auth (Google + email/password), which always
-- lives in the built-in "auth" schema regardless of this app's own schema —
-- so no users table is needed here. Shortlist and saved itineraries are
-- real, per-user tables below, keyed to auth.users. The BFF (Express
-- server, backend/src) is the only thing that ever talks to this database —
-- it uses the service role key, which bypasses row level security
-- entirely. The RLS policies below are defense-in-depth, not the actual
-- access control: the real security boundary is the server manually
-- filtering every query by the authenticated request's user id (see
-- backend/src/routes/shortlist.ts and backend/src/routes/itineraries.ts).
-- They only start to matter if a future change ever adds direct
-- client-side Supabase access.
--
-- WARNING: the drop below wipes all data currently in "tailortrip". Comment
-- it out if this schema already has real data you want to keep, and use
-- targeted ALTERs instead.
--
-- ─── One-time cleanup: old "public"-schema tables ──────────────────────
-- Before the backend/frontend split these 5 tables lived in "public" (the
-- old schema.sql had no schema prefix). "public" was TailorTrip-only up to
-- now — nothing else in this shared Supabase project used it — so it's safe
-- to drop just these tables. Only these named tables are touched; the
-- "public" schema itself is left in place (Supabase/PostgREST expects it to
-- exist, and other MVPs may use it later). Run this block once; after that
-- these tables won't exist to drop, so re-running is a no-op.

drop table if exists public.shortlist_items cascade;
drop table if exists public.itineraries cascade;
drop table if exists public.generated_destinations cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.analytics_events cascade;

drop schema if exists tailortrip cascade;

-- gen_random_uuid() (used below for itineraries.id) is provided by
-- pgcrypto — most Supabase projects already have it enabled project-wide,
-- but declared explicitly here so this script is self-sufficient.
create extension if not exists pgcrypto;

create schema tailortrip;

-- Only the service role ever touches these tables (the BFF is the sole
-- caller — see comment above), but anon/authenticated still need `usage` on
-- the schema itself for PostgREST to resolve it at all; RLS above (once
-- tables exist) is what actually keeps them out.
grant usage on schema tailortrip to service_role, anon, authenticated;
alter default privileges in schema tailortrip grant all on tables to service_role;
alter default privileges in schema tailortrip grant all on sequences to service_role;

create table tailortrip.analytics_events (
  id          bigint generated always as identity primary key,
  event_type  text not null,
  event_data  text,                 -- JSON payload
  created_at  timestamptz not null default now()
);

create index analytics_events_type_idx on tailortrip.analytics_events (event_type);
create index analytics_events_created_idx on tailortrip.analytics_events (created_at);
grant all on tailortrip.analytics_events to service_role;
grant usage, select on sequence tailortrip.analytics_events_id_seq to service_role;

-- ─── Shortlist ────────────────────────────────────────────────────────

create table tailortrip.shortlist_items (
  user_id         uuid not null references auth.users(id) on delete cascade,
  destination_id  text not null,
  created_at      timestamptz not null default now(),
  primary key (user_id, destination_id)
);

alter table tailortrip.shortlist_items enable row level security;
grant all on tailortrip.shortlist_items to service_role;

create policy "select own shortlist" on tailortrip.shortlist_items for select using (auth.uid() = user_id);
create policy "insert own shortlist" on tailortrip.shortlist_items for insert with check (auth.uid() = user_id);
create policy "delete own shortlist" on tailortrip.shortlist_items for delete using (auth.uid() = user_id);

-- ─── Saved itineraries ────────────────────────────────────────────────

create table tailortrip.itineraries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  inputs        jsonb not null,
  days          jsonb not null,
  generated_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table tailortrip.itineraries enable row level security;
grant all on tailortrip.itineraries to service_role;

create policy "select own itineraries" on tailortrip.itineraries for select using (auth.uid() = user_id);
create policy "insert own itineraries" on tailortrip.itineraries for insert with check (auth.uid() = user_id);

create index itineraries_user_idx on tailortrip.itineraries (user_id);

-- ─── AI-generated destination cache ────────────────────────────────────
-- Durable by-id lookup for AI-generated destinations
-- (backend/src/lib/destinationPool.ts). Not user-scoped data — a
-- destination a user shortlisted must stay resolvable for as long as that
-- shortlist_items row exists, well past any in-memory cache TTL or a
-- Render free-tier dyno idling out. No policies: only the service-role
-- server ever touches this table.

create table tailortrip.generated_destinations (
  id              text primary key,
  data            jsonb not null,
  schema_version  int not null default 1,
  created_at      timestamptz not null default now()
);

alter table tailortrip.generated_destinations enable row level security;
grant all on tailortrip.generated_destinations to service_role;

-- ─── Profile preferences ────────────────────────────────────────────────
-- Display name and avatar stay in auth.users (Supabase Auth), updated via
-- the admin API — this table is only for preferences that have nowhere else
-- to live: home base and defaults that personalize recommendations.

create table tailortrip.user_profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  home_city         text,
  home_state        text,
  preferred_moods   text[] not null default '{}',
  default_budget_id text,
  updated_at        timestamptz not null default now()
);

alter table tailortrip.user_profiles enable row level security;
grant all on tailortrip.user_profiles to service_role;

create policy "select own profile" on tailortrip.user_profiles for select using (auth.uid() = user_id);
create policy "upsert own profile" on tailortrip.user_profiles for insert with check (auth.uid() = user_id);
create policy "update own profile" on tailortrip.user_profiles for update using (auth.uid() = user_id);
--At last expose all tables in DATA API settings in project settings