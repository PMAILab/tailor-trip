// Strips a trailing slash so a copy-pasted "https://x.netlify.app/" still
// matches exactly against the browser's Origin header (which never has one)
// — a mismatch here silently breaks every cross-origin request with a CORS
// error, so it's normalized once and shared by CORS setup and redirects.
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN?.replace(/\/+$/, '') || undefined;

// Same trailing-slash trap for this API's own origin — a stray slash would
// double up in `${APP_ORIGIN}/api/auth/google/callback`.
export const APP_ORIGIN = process.env.APP_ORIGIN?.replace(/\/+$/, '') || undefined;
