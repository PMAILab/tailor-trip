import type { Response } from 'express';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser } from './supabaseAuth';

const isProd = process.env.NODE_ENV === 'production';

/** No `domain` attribute — host-only cookies work correctly regardless of
 *  which origin the frontend is served from. `sameSite: 'none'` in prod is
 *  required because the frontend (Netlify) and this API (Render) are
 *  different origins — the browser won't attach a `lax` cookie to the
 *  cross-site `fetch` calls in src/lib/api.ts. `none` requires `secure`,
 *  which is already tied to isProd. Dev keeps `lax` since Vite's proxy makes
 *  the browser see everything as same-origin. Unsigned: `tt_at`/`tt_rt` are
 *  validated by Supabase itself (tampering just yields an invalid-token
 *  error, no forged identity); `tt_oauth`'s PKCE seed, if tampered, breaks
 *  the exchange (Supabase rejects a mismatched verifier); `returnTo` is
 *  re-validated server-side regardless of cookie content. Signing would add
 *  no real security here. */
const base = {
  httpOnly: true as const,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProd,
  path: '/',
};

const DAY = 24 * 60 * 60 * 1000;

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

// ─── Real session (access + refresh token) ────────────────────────────

export function setSessionCookies(res: Response, session: Session): void {
  res.cookie('tt_at', session.access_token, { ...base, maxAge: session.expires_in * 1000 });
  res.cookie('tt_rt', session.refresh_token, { ...base, maxAge: 30 * DAY });
}

export function clearSessionCookies(res: Response): void {
  res.clearCookie('tt_at', base);
  res.clearCookie('tt_rt', base);
}

// ─── Mock session (no Supabase configured — local dev/demo) ───────────

export function setMockCookie(res: Response, user: AuthUser): void {
  res.cookie('tt_mock', encode(user), { ...base, maxAge: 30 * DAY });
}

export function clearMockCookie(res: Response): void {
  res.clearCookie('tt_mock', base);
}

export function readMockCookie(cookies: Record<string, string>): AuthUser | null {
  const raw = cookies.tt_mock;
  return raw ? decode<AuthUser>(raw) : null;
}

// ─── OAuth state (PKCE storage seed + post-login redirect target) ─────

export interface OAuthState {
  seed: Record<string, string>;
  returnTo: string;
}

const OAUTH_COOKIE_OPTS = { ...base, path: '/api/auth/google' };

export function setOAuthStateCookie(res: Response, state: OAuthState): void {
  res.cookie('tt_oauth', encode(state), { ...OAUTH_COOKIE_OPTS, maxAge: 5 * 60 * 1000 });
}

export function clearOAuthStateCookie(res: Response): void {
  res.clearCookie('tt_oauth', OAUTH_COOKIE_OPTS);
}

export function readOAuthStateCookie(cookies: Record<string, string>): OAuthState | null {
  const raw = cookies.tt_oauth;
  return raw ? decode<OAuthState>(raw) : null;
}

// ─── Safe post-login redirect target ───────────────────────────────────

/** Only ever redirect to a same-origin relative path — never trust a raw
 *  query param as an absolute or protocol-relative URL (open redirect). */
export function sanitizeReturnTo(raw: unknown, fallback = '/discover'): string {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return fallback;
  }
  try {
    const resolved = new URL(raw, 'http://localhost');
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}
