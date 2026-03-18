-- ╔════════════════════════════════════════════════╗
-- ║          TailorTrip — Supabase Schema          ║
-- ║  Run this in the Supabase SQL Editor once.     ║
-- ╚════════════════════════════════════════════════╝

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  state          TEXT NOT NULL,
  hero_images    TEXT NOT NULL,       -- JSON array of image URLs
  sentiment      TEXT NOT NULL,       -- JSON array of sentiment strings
  description    TEXT NOT NULL,
  moods          TEXT NOT NULL,       -- JSON array of mood IDs
  duration_days  INTEGER NOT NULL
);

-- Monthly data (cost, crowd, weather per month per destination)
CREATE TABLE IF NOT EXISTS monthly_data (
  id              SERIAL PRIMARY KEY,
  destination_id  TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  month           INTEGER NOT NULL,   -- 1=Jan … 12=Dec
  estimated_cost  INTEGER NOT NULL,
  crowd_level     TEXT NOT NULL,      -- 'Low' | 'Medium' | 'High'
  weather         TEXT NOT NULL,      -- 'Pleasant' | 'Cold' | 'Hot' | 'Rainy'
  UNIQUE (destination_id, month)
);

-- Single user preferences row (id = 'default')
CREATE TABLE IF NOT EXISTS user_preferences (
  id                    TEXT PRIMARY KEY DEFAULT 'default',
  name                  TEXT,
  preferred_budget_range TEXT,        -- JSON: { min, max }
  moods                 TEXT          -- JSON array of mood IDs
);

-- Saved / shortlisted trips
CREATE TABLE IF NOT EXISTS saved_trips (
  id              SERIAL PRIMARY KEY,
  destination_id  TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (destination_id)
);

-- Analytics events log
CREATE TABLE IF NOT EXISTS analytics_events (
  id          SERIAL PRIMARY KEY,
  event_type  TEXT NOT NULL,
  event_data  TEXT,                   -- JSON
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
