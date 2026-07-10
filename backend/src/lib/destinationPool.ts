import { DESTINATIONS } from '../data/constants.js';
import type { Destination } from '../types/types.js';
import { generateDestinationSet, toDestination } from '../services/geminiDestinations.js';
import { resolveHeroImages } from '../services/images.js';
import { getOrSet, peek, TtlStore } from './cache.js';
import { supabase } from './supabaseClient.js';

const SCHEMA_VERSION = 'v1';
const SUPERSET_SIZE = 24; // over-fetched per pool bucket in one Gemini call — enough for ~2 pages of scroll
const REQUEST_TIMEOUT_MS = 3500; // user-facing: never make the page wait longer than this
const BACKGROUND_TIMEOUT_MS = 25000; // hard ceiling for the continuation once the request has bailed — generous so a merely-slow Gemini call (e.g. free-tier throttling) can still finish and populate the cache instead of aborting; still bounded so a genuinely hung call can't wedge this pool bucket forever
// Free-tier Gemini is capped at ~20 requests/day total across the whole app,
// so pool generation (one call per cache bucket) has to be spent carefully —
// a 1h TTL could burn the entire daily quota from location buckets alone.
// 6h still refreshes content a few times a day while keeping this affordable.
const POOL_TTL_MS = 6 * 60 * 60 * 1000;
const EMPTY_POOL_TTL_MS = 15 * 60 * 1000; // retry window for a failed/quota-exhausted generation — long enough not to hammer a hard-down quota, short enough to self-heal
const BY_ID_TTL_MS = 24 * 60 * 60 * 1000;

// Seeded once per generated destination so shortlist/trip-detail/compare
// lookups keep working after the pool that produced it has rotated or expired.
const byIdCache = new TtlStore<Destination>(BY_ID_TTL_MS);

function bucket(n: number): number {
  return Math.round(n / 0.5) * 0.5;
}

function poolKeyFor(input: { scope: 'near' | 'country'; lat?: number; lng?: number }): string {
  if (input.scope === 'near' && input.lat !== undefined && input.lng !== undefined) {
    return `${SCHEMA_VERSION}:near:${bucket(input.lat)}:${bucket(input.lng)}`;
  }
  return `${SCHEMA_VERSION}:country`;
}

/** The static catalog ships with hardcoded hero images (picked once, can go
 *  stale or be wrong — e.g. a mismatched photo pasted in for a destination)
 *  and normally never touches Unsplash at all, since only AI-generated pool
 *  entries go through `resolveHeroImages`. This brings the static fallback
 *  onto live Unsplash too, without slowing down the fallback path it backs:
 *  serve whatever's cached right now (hardcoded on a cold cache, live once
 *  warm) and kick off a background fetch on a miss so the *next* request —
 *  which, given how often generation times out, is usually moments away —
 *  gets the real photo. Mirrors the `assemblePoolWithTimeout` background
 *  pattern above. */
export function withLiveImages(destinations: Destination[]): Destination[] {
  return destinations.map((d) => {
    const query = `${d.name}, ${d.state}`;
    const live = peek<string[]>(`unsplash:${query.trim().toLowerCase()}:2`);
    if (!live) void resolveHeroImages(query, 2);
    return live ? { ...d, heroImages: live } : d;
  });
}

function persistDestination(d: Destination): void {
  if (!supabase) return;
  void (async () => {
    try {
      const { error } = await supabase.from('generated_destinations').upsert({ id: d.id, data: d, schema_version: 1 });
      if (error) console.error('Failed to persist generated destination:', error);
    } catch (err) {
      console.error('Failed to persist generated destination:', err);
    }
  })();
}

async function assemblePool(
  scope: 'near' | 'country',
  lat: number | undefined,
  lng: number | undefined,
  signal: AbortSignal,
): Promise<Destination[]> {
  const raw = await generateDestinationSet({
    scope,
    lat,
    lng,
    excludeIds: DESTINATIONS.map((d) => d.id),
    count: SUPERSET_SIZE,
    signal,
  });
  if (raw.length === 0) return [];

  const withImages = await Promise.all(
    raw.map(async (r) => {
      const heroImages = await resolveHeroImages(r.imageQuery, 2);
      return toDestination(r, heroImages);
    }),
  );

  for (const d of withImages) {
    byIdCache.set(d.id, d);
    persistDestination(d);
  }
  return withImages;
}

function assemblePoolWithTimeout(scope: 'near' | 'country', lat?: number, lng?: number): Promise<Destination[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BACKGROUND_TIMEOUT_MS);
  return assemblePool(scope, lat, lng, controller.signal).finally(() => clearTimeout(timer));
}

export interface DestinationPoolResult {
  destinations: Destination[];
  fallback: boolean;
  poolKey: string;
}

/** Location-aware destination pool: cache hit → near-instant; cache miss →
 *  races generation against a hard 3.5s ceiling so the UI never waits on a
 *  slow AI/image call, falling back to the static catalog immediately on
 *  timeout while the real generation keeps running in the background to
 *  populate the cache for the next request.
 *
 *  If `poolKey` is supplied (a value the client got back from a prior
 *  response — used for page 2+ of infinite scroll), that exact cached
 *  superset is reused via a synchronous peek instead of recomputing the
 *  bucket from live coordinates: GPS drift between page 1 and page 2 could
 *  otherwise round into a different 0.5° bucket mid-session, and
 *  regenerating would risk showing different AI content than page 1 did. If
 *  that pool has since expired/been evicted, this degrades to static rather
 *  than risk an inconsistent mid-scroll switch to different AI content. */
export async function getDestinationPool(input: {
  scope: 'near' | 'country';
  lat?: number;
  lng?: number;
  poolKey?: string;
}): Promise<DestinationPoolResult> {
  if (input.poolKey) {
    if (input.poolKey.startsWith('static:')) {
      return { destinations: withLiveImages(DESTINATIONS), fallback: true, poolKey: input.poolKey };
    }
    const cached = peek<Destination[]>(input.poolKey);
    if (cached && cached.length > 0) {
      return { destinations: cached, fallback: false, poolKey: input.poolKey };
    }
    return { destinations: withLiveImages(DESTINATIONS), fallback: true, poolKey: `static:${input.poolKey}` };
  }

  const poolKey = poolKeyFor(input);
  const generation = getOrSet(
    poolKey,
    (value: Destination[]) => (value.length > 0 ? POOL_TTL_MS : EMPTY_POOL_TTL_MS),
    () => assemblePoolWithTimeout(input.scope, input.lat, input.lng),
  );

  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), REQUEST_TIMEOUT_MS);
  });
  const superset = await Promise.race([generation, timeout]);

  if (superset && superset.length > 0) {
    return { destinations: superset, fallback: false, poolKey };
  }
  return { destinations: withLiveImages(DESTINATIONS), fallback: true, poolKey: `static:${poolKey}` };
}

/** Resolves a single destination by id for trip-details/shortlist/compare,
 *  regardless of whether the pool that produced it is still cached:
 *  in-memory by-id cache → static catalog → Supabase read-through (only hit
 *  on a cold/expired id, not the hot recommendations path). */
export async function getDestinationById(id: string): Promise<Destination | null> {
  const cached = byIdCache.get(id);
  if (cached) return cached;

  const stat = DESTINATIONS.find((d) => d.id === id);
  if (stat) return withLiveImages([stat])[0];

  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('generated_destinations')
      .select('data')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    const destination = data.data as Destination;
    byIdCache.set(id, destination);
    return destination;
  } catch (err) {
    console.error('getDestinationById Supabase read-through failed:', err);
    return null;
  }
}
