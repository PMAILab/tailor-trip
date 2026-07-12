import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Response } from 'express';
import { env } from '../config/env.js';

const url = env.supabaseUrl;
const key = env.supabaseServiceRoleKey;

export const isSupabaseConfigured = Boolean(url && key);

export type Db = SupabaseClient<any, any, 'tailortrip'>;

/** Server-side Supabase client (service role). Null when unconfigured, so the
 *  BFF degrades to in-memory data and best-effort analytics. Scoped to the
 *  "tailortrip" schema (not "public") — this Supabase project hosts multiple
 *  MVPs side by side, one Postgres schema each, to avoid table-name
 *  collisions. Requires "tailortrip" to be added under Project Settings →
 *  API → Data API Settings → Exposed schemas (see backend/supabase/schema.sql). */
export const supabase: Db | null = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: false },
      db: { schema: 'tailortrip' },
    })
  : null;

/** Returns the DB client, or sends a 503 and returns null if it isn't
 *  configured. Call at the top of any route handler that can't proceed
 *  without it — centralizes a check that used to be copy-pasted across
 *  shortlist/itineraries/profile routes, and (unlike a bare `if (!supabase)`
 *  guard hidden behind a helper) still narrows to a non-null client for the
 *  rest of the handler since it's returned, not just checked. */
export function requireDb(res: Response): Db | null {
  if (!supabase) {
    res.status(503).json({ error: 'Database unavailable' });
    return null;
  }
  return supabase;
}
