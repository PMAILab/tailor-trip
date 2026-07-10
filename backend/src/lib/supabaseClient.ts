import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

const url = env.supabaseUrl;
const key = env.supabaseServiceRoleKey;

export const isSupabaseConfigured = Boolean(url && key);

/** Server-side Supabase client (service role). Null when unconfigured, so the
 *  BFF degrades to in-memory data and best-effort analytics. Scoped to the
 *  "tailortrip" schema (not "public") — this Supabase project hosts multiple
 *  MVPs side by side, one Postgres schema each, to avoid table-name
 *  collisions. Requires "tailortrip" to be added under Project Settings →
 *  API → Data API Settings → Exposed schemas (see backend/supabase/schema.sql). */
export const supabase: SupabaseClient<any, any, 'tailortrip'> | null = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: false },
      db: { schema: 'tailortrip' },
    })
  : null;
