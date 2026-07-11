// Central typed access to process.env — every other module reads env vars
// through `env.x` instead of a scattered raw `process.env.X`. Relies on
// src/env.ts having already run `dotenv.config()` as the very first import
// in src/index.ts (see that file's comment for why the ordering matters);
// this module doesn't call dotenv itself.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const env = {
  isProd: process.env.NODE_ENV === 'production',
  port: Number(optional('PORT', '3002')),
  // No fallback here on purpose — unset means "derive from the request"
  // downstream (see routes/auth.ts), not "assume localhost:3000".
  appOrigin: optional('APP_ORIGIN').replace(/\/+$/, '') || undefined,
  frontendOrigin: optional('FRONTEND_ORIGIN').replace(/\/+$/, '') || undefined,
  supabaseUrl: optional('SUPABASE_URL'),
  supabaseAnonKey: optional('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY'),
  vertexApiKey: optional('VERTEX_API_KEY'),
  unsplashAccessKey: optional('UNSPLASH_ACCESS_KEY'),
  travelpayoutsMarker: optional('TRAVELPAYOUTS_MARKER'),
};

export { required, optional };
