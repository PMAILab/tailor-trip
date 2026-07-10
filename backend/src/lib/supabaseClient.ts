import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && key);

/** Server-side Supabase client (service role). Null when unconfigured, so the
 *  BFF degrades to in-memory data and best-effort analytics. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, key as string, { auth: { persistSession: false } })
  : null;
