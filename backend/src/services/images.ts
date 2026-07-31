import { getOrSet } from '../lib/cache.js';
import { env } from '../config/env.js';
import type { ImageCredit } from '../types/types.js';

const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos';
const TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // photos don't go stale — cache for a week
const FALLBACK_CACHE_TTL_MS = 5 * 60 * 1000; // retry window after a rate-limited or failed lookup

// The Unsplash API Guidelines require every link back to unsplash.com to
// carry these, naming the application — it's how they attribute referral
// traffic, and complying with it is a condition of production access.
const UTM = 'utm_source=TailorTrip&utm_medium=referral';
export const UNSPLASH_HOME_URL = `https://unsplash.com/?${UTM}`;

function withUtm(profileUrl: string): string {
  return `${profileUrl}${profileUrl.includes('?') ? '&' : '?'}${UTM}`;
}

export interface HeroImages {
  urls: string[];
  /** Parallel to `urls`. Empty for the hardcoded fallbacks below, whose
   *  photographers aren't known to us. */
  credits: ImageCredit[];
}

// Generic scenic-India stock photos, reused from the existing hand-picked
// catalog, for when Unsplash is unconfigured, times out, or errors — hero
// images must never be empty.
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&q=80&w=1935',
  'https://images.unsplash.com/photo-1590050751776-0cd1c0a12ce0?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=2069',
  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1974',
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&q=80&w=2069',
];

export function isUnsplashConfigured(): boolean {
  const key = env.unsplashAccessKey;
  return Boolean(key && key !== 'your-unsplash-access-key');
}

function fallbackImages(count: number): HeroImages {
  const shuffled = [...FALLBACK_IMAGES].sort(() => Math.random() - 0.5);
  return { urls: shuffled.slice(0, Math.max(1, count)), credits: [] };
}

interface UnsplashPhoto {
  urls?: { regular?: string };
  links?: { download_location?: string };
  user?: { name?: string; username?: string; links?: { html?: string } };
}

/** Pings Unsplash's download endpoint for a photo. Required by the API
 *  Guidelines whenever a photo is surfaced to a user — it's how photographers
 *  see their work being used, and Unsplash audits for it. Fire-and-forget:
 *  this must never delay or fail a page render. */
function trackUsage(downloadLocation: string): void {
  void fetch(`${downloadLocation}${downloadLocation.includes('?') ? '&' : '?'}client_id=${env.unsplashAccessKey}`)
    .catch(() => {
      /* attribution telemetry is best-effort; never surface it */
    });
}

async function fetchFromUnsplash(query: string, count: number): Promise<HeroImages> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${UNSPLASH_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${env.unsplashAccessKey}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Unsplash request failed: ${res.status}`);
    const data = (await res.json()) as { results?: UnsplashPhoto[] };

    const urls: string[] = [];
    const credits: ImageCredit[] = [];
    for (const photo of data.results ?? []) {
      const src = photo.urls?.regular;
      const profile = photo.user?.links?.html;
      // A photo we can't attribute is one we can't legitimately show, so
      // it's dropped rather than displayed uncredited.
      if (!src || !profile) continue;
      urls.push(src);
      credits.push({
        photographer: photo.user?.name?.trim() || photo.user?.username?.trim() || 'Unsplash photographer',
        profileUrl: withUtm(profile),
        downloadLocation: photo.links?.download_location,
      });
      if (photo.links?.download_location) trackUsage(photo.links.download_location);
    }
    return urls.length > 0 ? { urls, credits } : fallbackImages(count);
  } catch (err) {
    // Includes AbortError from the timeout — never let an image failure
    // propagate, this must always resolve.
    console.error('Unsplash search failed:', err instanceof Error ? err.message : err);
    return fallbackImages(count);
  } finally {
    clearTimeout(timer);
  }
}

/** Real, licensed photos for a destination via Unsplash, keyed by an
 *  AI-suggested search query. Own cache namespace (separate from the
 *  destination pool cache) since Unsplash's free tier caps at 50 req/hour —
 *  one popular pool of 20+ destinations could otherwise burn most of that
 *  budget in a single page load. Falls back to a generic scenic-India pool
 *  when unconfigured or on any failure; never rejects. */
export async function resolveHeroImages(query: string, count = 2): Promise<HeroImages> {
  if (!isUnsplashConfigured()) return fallbackImages(count);
  const key = `unsplash:${query.trim().toLowerCase()}:${count}`;
  // Only a real, attributable result earns the week-long TTL. A rate-limited
  // or failed lookup resolves to the uncredited generic pool, and caching
  // *that* for a week would strand the destination on an unattributable photo
  // long after the quota recovered — which is both a worse experience and an
  // Unsplash guideline violation. Short TTL lets it self-heal instead.
  return getOrSet(
    key,
    (value: HeroImages) => (value.credits.length > 0 ? CACHE_TTL_MS : FALLBACK_CACHE_TTL_MS),
    () => fetchFromUnsplash(`${query} India`, count),
  );
}
