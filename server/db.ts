import Database from 'better-sqlite3';
import path from 'path';
import { DESTINATIONS } from '../src/data/constants';

const DB_PATH = path.join(process.cwd(), 'tailor-trip.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
    seedIfEmpty();
  }
  return db;
}

function initTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      hero_images TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      description TEXT NOT NULL,
      moods TEXT NOT NULL,
      duration_days INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      estimated_cost INTEGER NOT NULL,
      crowd_level TEXT NOT NULL,
      weather TEXT NOT NULL,
      FOREIGN KEY (destination_id) REFERENCES destinations(id),
      UNIQUE(destination_id, month)
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY DEFAULT 'default',
      name TEXT,
      preferred_budget_range TEXT,
      moods TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id TEXT NOT NULL,
      saved_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (destination_id) REFERENCES destinations(id),
      UNIQUE(destination_id)
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedIfEmpty(): void {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM destinations').get() as { cnt: number };
  if (count.cnt > 0) return;

  const insertDest = db.prepare(`
    INSERT INTO destinations (id, name, state, hero_images, sentiment, description, moods, duration_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMonthly = db.prepare(`
    INSERT INTO monthly_data (destination_id, month, estimated_cost, crowd_level, weather)
    VALUES (?, ?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    for (const dest of DESTINATIONS) {
      insertDest.run(
        dest.id,
        dest.name,
        dest.state,
        JSON.stringify(dest.heroImages),
        JSON.stringify(dest.sentiment),
        dest.description,
        JSON.stringify(dest.moods),
        dest.durationDays
      );

      for (const md of dest.monthlyData) {
        insertMonthly.run(dest.id, md.month, md.estimatedCost, md.crowdLevel, md.weather);
      }
    }
  });

  seedAll();
  console.log(`Seeded ${DESTINATIONS.length} destinations with monthly data.`);
}
