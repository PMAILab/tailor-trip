import { getOrSet } from '../lib/cache.js';
import { env } from '../config/env.js';

const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos';
const TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // photos don't go stale — cache for a week

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

function fallbackImages(count: number): string[] {
  const shuffled = [...FALLBACK_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(1, count));
}

interface UnsplashPhoto {
  urls?: { regular?: string };
}

async function fetchFromUnsplash(query: string, count: number): Promise<string[]> {
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
    const urls = (data.results ?? [])
      .map((p) => p.urls?.regular)
      .filter((u): u is string => Boolean(u));
    return urls.length > 0 ? urls : fallbackImages(count);
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
export async function resolveHeroImages(query: string, count = 2): Promise<string[]> {
  if (!isUnsplashConfigured()) return fallbackImages(count);
  const key = `unsplash:${query.trim().toLowerCase()}:${count}`;
  return getOrSet(key, CACHE_TTL_MS, () => fetchFromUnsplash(`${query} India`, count));
}
