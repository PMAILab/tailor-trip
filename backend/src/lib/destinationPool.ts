import { DESTINATIONS } from '../data/constants.js';
import type { Destination } from '../types/types.js';
import { generateDestinationSet, toDestination } from '../services/geminiDestinations.js';
import { resolveHeroImages } from '../services/images.js';
import { cacheSet, getOrSet, peek, TtlStore } from './cache.js';
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
// Extra AI batches fetched on demand once a pool bucket is close to running
// out mid-scroll, so infinite scroll keeps surfacing new AI places instead of
// dead-ending at SUPERSET_SIZE. Capped hard: each extension is one more
// Gemini call on top of the initial pool fetch, and the daily quota (see
// above) can't sustain unlimited ones per bucket.
const EXTENSION_SIZE = 12;
const MAX_EXTENSIONS = 2; // + the initial fetch = at most 3 Gemini calls per bucket per POOL_TTL_MS window

// Seeded once per generated destination so shortlist/trip-detail/compare
// lookups keep working after the pool that produced it has rotated or expired.
const byIdCache = new TtlStore<Destination>(BY_ID_TTL_MS);
// Tracks how many extension batches a pool bucket has already spent, plus the
// in-flight promise itself (not just a boolean) so a request that lands right
// on the boundary can await the extension that's already running instead of
// firing a duplicate one or answering stale. Shares the pool's own TTL so a
// bucket that rotates out also gets a clean slate.
interface ExtensionState {
  count: number;
  inFlight: Promise<void> | null;
}
const extensionState = new TtlStore<ExtensionState>(POOL_TTL_MS);

function extensionStateFor(poolKey: string): ExtensionState {
  let state = extensionState.get(poolKey);
  if (!state) {
    state = { count: 0, inFlight: null };
    extensionState.set(poolKey, state);
  }
  return state;
}

/** Whether this bucket could still grow — either an extension is running
 *  right now or the per-bucket budget isn't spent yet. `hasMore` on the route
 *  side stays true while this is true, even if the current page has run out
 *  of already-fetched items, so scroll doesn't dead-end mid-extension. */
function canGrow(poolKey: string): boolean {
  const state = extensionState.get(poolKey);
  if (!state) return true; // budget untouched — nothing to say no to yet
  return state.inFlight !== null || state.count < MAX_EXTENSIONS;
}

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

/** Top-up of an existing pool bucket: generates one more batch of AI
 *  destinations (excluding everything already in the pool or the static
 *  catalog) and appends it to the cached array under the same `poolKey`.
 *  Idempotent per bucket — concurrent callers all get back the same in-flight
 *  promise instead of each starting their own Gemini call. No-ops past
 *  `MAX_EXTENSIONS`. Callers decide whether to await this (a request right on
 *  the boundary, see `getDestinationPool`) or fire it and move on (a request
 *  just inside the lookahead margin, still has data to serve now). */
function extendPool(poolKey: string, scope: 'near' | 'country', lat?: number, lng?: number): Promise<void> {
  if (poolKey.startsWith('static:')) return Promise.resolve();

  const state = extensionStateFor(poolKey);
  if (state.inFlight) return state.inFlight;
  if (state.count >= MAX_EXTENSIONS) return Promise.resolve();

  const run = (async () => {
    try {
      const current = peek<Destination[]>(poolKey);
      if (!current) return; // bucket already rotated out from under us

      const raw = await generateDestinationSet({
        scope,
        lat,
        lng,
        excludeIds: [...DESTINATIONS.map((d) => d.id), ...current.map((d) => d.id)],
        count: EXTENSION_SIZE,
      });
      if (raw.length === 0) return;

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

      // Re-peek rather than append to the stale `current` closed over above —
      // another request may have read/refreshed the bucket while this call
      // was in flight (e.g. a normal TTL-driven regeneration).
      const latest = peek<Destination[]>(poolKey) ?? current;
      cacheSet(poolKey, [...latest, ...withImages], POOL_TTL_MS);
      state.count += 1;
    } catch (err) {
      console.error('Pool extension failed:', err);
    } finally {
      state.inFlight = null;
    }
  })();

  state.inFlight = run;
  return run;
}

export interface DestinationPoolResult {
  destinations: Destination[];
  fallback: boolean;
  poolKey: string;
  /** True if this bucket could still grow (extension running or budget
   *  unspent) — the route keeps `hasMore` true on this signal alone so
   *  scroll doesn't stop right as an extension is landing. Always false for
   *  the static catalog, which never grows. */
  canGrow: boolean;
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
 *  than risk an inconsistent mid-scroll switch to different AI content.
 *
 *  `pageEnd` (offset + limit of the page actually being served) and
 *  `lookaheadEnd` (typically one page further out) drive two things: a
 *  background top-up once the caller is within `lookaheadEnd` of the cached
 *  superset's end — ahead of actually hitting it, so new AI destinations are
 *  usually ready by the time they're needed — and, if `pageEnd` itself has
 *  already run past what's cached (the lookahead didn't win the race), a
 *  short bounded wait for that same extension so this request has a real
 *  shot at returning the newly grown pool instead of reporting
 *  `hasMore: false` moments before it lands (see `extendPool`). */
export async function getDestinationPool(input: {
  scope: 'near' | 'country';
  lat?: number;
  lng?: number;
  poolKey?: string;
  pageEnd?: number;
  lookaheadEnd?: number;
}): Promise<DestinationPoolResult> {
  if (input.poolKey) {
    if (input.poolKey.startsWith('static:')) {
      return { destinations: withLiveImages(DESTINATIONS), fallback: true, poolKey: input.poolKey, canGrow: false };
    }
    let cached = peek<Destination[]>(input.poolKey);
    if (cached && cached.length > 0) {
      const pageEnd = input.pageEnd ?? 0;
      const lookaheadEnd = input.lookaheadEnd ?? pageEnd;

      if (pageEnd > cached.length) {
        // Already past the cached end — this page would otherwise come back
        // empty right as the pool is growing. Give the extension (already
        // triggered by an earlier request's lookahead, or started fresh here)
        // a bounded window to land before answering with what we've got.
        const inFlight = extendPool(input.poolKey, input.scope, input.lat, input.lng);
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, REQUEST_TIMEOUT_MS));
        await Promise.race([inFlight, timeout]);
        cached = peek<Destination[]>(input.poolKey) ?? cached;
      } else if (cached.length <= lookaheadEnd) {
        // Within the lookahead margin — top up now so a *later* request
        // (ideally before it ever hits the branch above) finds more waiting.
        void extendPool(input.poolKey, input.scope, input.lat, input.lng);
      }

      return { destinations: cached, fallback: false, poolKey: input.poolKey, canGrow: canGrow(input.poolKey) };
    }
    return { destinations: withLiveImages(DESTINATIONS), fallback: true, poolKey: `static:${input.poolKey}`, canGrow: false };
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
    return { destinations: superset, fallback: false, poolKey, canGrow: canGrow(poolKey) };
  }
  return { destinations: withLiveImages(DESTINATIONS), fallback: true, poolKey: `static:${poolKey}`, canGrow: false };
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
