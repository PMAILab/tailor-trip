import { env } from '../config/env.js';

// Trailing slash already stripped in config/env.ts — a copy-pasted
// "https://x.netlify.app/" would otherwise stop matching the browser's
// Origin header (which never has one), silently breaking every
// cross-origin request with a CORS error.
export const FRONTEND_ORIGIN = env.frontendOrigin;

// Same trailing-slash trap for this API's own origin — a stray slash would
// double up in `${APP_ORIGIN}/api/auth/google/callback`.
export const APP_ORIGIN = env.appOrigin;
