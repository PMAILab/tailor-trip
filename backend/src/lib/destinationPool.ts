import { DESTINATIONS } from '../data/constants.js';
import type { Destination } from '../types/types.js';
import { DESTINATION_THEMES, generateDestinationSet, toDestination } from '../services/geminiDestinations.js';
import { resolveHeroImages } from '../services/images.js';
import { cacheSet, getOrSet, peek, TtlStore } from './cache.js';
import { supabase } from './supabaseClient.js';

const SCHEMA_VERSION = 'v1';
// Generation cost is dominated by output volume, and it degrades badly with
// batch size: measured against gemini-3.1-pro-preview, 6 destinations takes
// ~23s, 12 takes ~33s, and 24 in a single call does not finish inside two
// minutes. So a pool is assembled from several small batches issued in
// parallel (each themed, see DESTINATION_THEMES) rather than one big call —
// same superset size, but bounded by the slowest single batch instead of the
// sum of them.
const BATCH_SIZE = 8;
const INITIAL_BATCHES = 3; // 3 x 8 = 24 destinations, in roughly the time one batch takes
const REQUEST_TIMEOUT_MS = 3500; // first paint: never make the initial page wait longer than this
// A "load more" request is a different bargain from the first paint: the user
// already has a full screen of cards and sees skeleton placeholders, so it's
// worth waiting out an actual generation rather than answering "no more
// results" and killing the scroll for good.
const EXTENSION_WAIT_MS = 30000;
// Hard ceiling for a background generation once the request itself has bailed
// — comfortably past the measured batch latency so a merely-slow call still
// lands and warms the cache, while a genuinely hung one can't wedge the
// bucket forever.
const BACKGROUND_TIMEOUT_MS = 90000;
// Generation is routed through Vertex AI (see services/gemini.ts), so it is
// billed to the GCP project rather than capped by the Gemini Developer API's
// ~20-requests/day free tier. A 6h TTL is therefore about content freshness,
// not quota survival: it refreshes a few times a day without regenerating a
// bucket for every visitor.
const POOL_TTL_MS = 6 * 60 * 60 * 1000;
const EMPTY_POOL_TTL_MS = 15 * 60 * 1000; // retry window for a failed generation — long enough not to hammer a hard-down backend, short enough to self-heal
const BY_ID_TTL_MS = 24 * 60 * 60 * 1000;
// Ceiling on how far a bucket will keep growing as the user scrolls. A
// cost/sanity limit rather than a quota one — nobody scrolls 120 destination
// cards, and India's supply of distinct, genuinely recommendable destinations
// thins out well before that anyway.
const MAX_POOL_SIZE = 120;

// Seeded once per generated destination so shortlist/trip-detail/compare
// lookups keep working after the pool that produced it has rotated or expired.
const byIdCache = new TtlStore<Destination>(BY_ID_TTL_MS);
// Holds each bucket's in-flight extension promise (not just a boolean) so a
// request that runs out of destinations can await the extension already
// running instead of firing a duplicate one or answering stale. Shares the
// pool's own TTL so a bucket that rotates out also gets a clean slate.
// `exhausted` latches when a generation comes back with nothing new to add,
// which is the real end of the road for a bucket — the model has run out of
// distinct places to suggest, and retrying just burns calls to no effect.
interface ExtensionState {
  inFlight: Promise<void> | null;
  exhausted: boolean;
}
const extensionState = new TtlStore<ExtensionState>(POOL_TTL_MS);
// Buckets whose first generation is still running. While a key is in here the
// static catalog is being served only as a placeholder, so callers should
// keep offering "more" — an upgrade to real AI destinations is imminent.
const warmingPools = new Set<string>();

/** Starts (or joins) the initial generation for a bucket, tracking it in
 *  `warmingPools` for as long as it runs. */
function warmPool(liveKey: string, scope: 'near' | 'country', lat?: number, lng?: number): Promise<Destination[]> {
  const generation = getOrSet(
    liveKey,
    (value: Destination[]) => (value.length > 0 ? POOL_TTL_MS : EMPTY_POOL_TTL_MS),
    () => {
      warmingPools.add(liveKey);
      return assemblePoolWithTimeout(scope, lat, lng);
    },
  );
  void generation.finally(() => warmingPools.delete(liveKey)).catch(() => {});
  return generation;
}

function extensionStateFor(poolKey: string): ExtensionState {
  let state = extensionState.get(poolKey);
  if (!state) {
    state = { inFlight: null, exhausted: false };
    extensionState.set(poolKey, state);
  }
  return state;
}

/** Whether this bucket could still grow: an extension is running right now,
 *  or there's headroom under MAX_POOL_SIZE and generation hasn't already come
 *  up empty. `hasMore` on the route side stays true while this is true even
 *  after the current pool is fully served, so scroll doesn't dead-end just
 *  because more places haven't been generated *yet*. */
function canGrow(poolKey: string): boolean {
  if (poolKey.startsWith('static:')) return false;
  const state = extensionState.get(poolKey);
  if (state?.inFlight) return true;
  if (state?.exhausted) return false;
  return (peek<Destination[]>(poolKey)?.length ?? 0) < MAX_POOL_SIZE;
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

/** Resolves photos for a batch of raw AI candidates, seeds the by-id and
 *  Supabase caches, and returns them as full Destinations. */
async function materialize(raw: Awaited<ReturnType<typeof generateDestinationSet>>): Promise<Destination[]> {
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

/** Runs `count` themed generation batches concurrently and merges them,
 *  dropping any id already known (the batches can't see each other's output,
 *  so overlap is deduped here rather than prevented). `themeOffset` rotates
 *  which themes are used, so a later top-up explores a different slice of the
 *  travel space than the initial pool did. A batch that fails or times out
 *  contributes nothing without taking its siblings down with it. */
async function generateBatches(
  scope: 'near' | 'country',
  lat: number | undefined,
  lng: number | undefined,
  knownIds: Set<string>,
  count: number,
  themeOffset: number,
  signal: AbortSignal,
): Promise<Destination[]> {
  const excludeIds = [...knownIds];
  const batches = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      generateDestinationSet({
        scope,
        lat,
        lng,
        excludeIds,
        count: BATCH_SIZE,
        theme: DESTINATION_THEMES[(themeOffset + i) % DESTINATION_THEMES.length],
        signal,
      }).catch((err) => {
        console.error('Destination batch failed:', err);
        return [];
      }),
    ),
  );

  const merged: Awaited<ReturnType<typeof generateDestinationSet>> = [];
  const seen = new Set(knownIds);
  for (const batch of batches) {
    for (const candidate of batch) {
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      merged.push(candidate);
    }
  }
  return merged.length > 0 ? materialize(merged) : [];
}

function assemblePool(
  scope: 'near' | 'country',
  lat: number | undefined,
  lng: number | undefined,
  signal: AbortSignal,
): Promise<Destination[]> {
  return generateBatches(scope, lat, lng, new Set(DESTINATIONS.map((d) => d.id)), INITIAL_BATCHES, 0, signal);
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
 *  promise instead of each starting their own Gemini call. Callers decide
 *  whether to await it (a request that has run out of destinations to serve)
 *  or fire it and move on (a request still inside the lookahead margin). */
function extendPool(poolKey: string, scope: 'near' | 'country', lat?: number, lng?: number): Promise<void> {
  if (!canGrow(poolKey)) return Promise.resolve();

  const state = extensionStateFor(poolKey);
  if (state.inFlight) return state.inFlight;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BACKGROUND_TIMEOUT_MS);

  const run = (async () => {
    try {
      const current = peek<Destination[]>(poolKey);
      if (!current) return; // bucket already rotated out from under us

      const known = new Set([...DESTINATIONS.map((d) => d.id), ...current.map((d) => d.id)]);
      // Rotate onto themes the pool hasn't drawn from yet, so a top-up
      // explores a different slice of the country than what's already shown.
      const themeOffset = Math.floor(current.length / BATCH_SIZE);
      const fresh = await generateBatches(scope, lat, lng, known, 1, themeOffset, controller.signal);

      // A batch that comes back with nothing genuinely new means the model has
      // run out of distinct places for this bucket — latch that rather than
      // burning another call on the next scroll to learn the same thing.
      if (fresh.length === 0) {
        state.exhausted = true;
        return;
      }

      // Re-peek rather than append to the stale `current` closed over above —
      // another request may have read/refreshed the bucket while this call
      // was in flight (e.g. a normal TTL-driven regeneration).
      const latest = peek<Destination[]>(poolKey) ?? current;
      const have = new Set(latest.map((d) => d.id));
      cacheSet(poolKey, [...latest, ...fresh.filter((d) => !have.has(d.id))], POOL_TTL_MS);
    } catch (err) {
      console.error('Pool extension failed:', err);
    } finally {
      clearTimeout(timer);
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
 *  `lookahead` (how many more destinations the caller expects to need beyond
 *  what it has already consumed) kicks off a background top-up before the
 *  pool actually runs dry, so fresh AI destinations are usually cached by the
 *  time the next scroll asks for them. A caller that has genuinely run out
 *  should instead await `growDestinationPool` and re-read (see the route),
 *  since only the caller knows whether its own mood/budget filtering left it
 *  short. */
export async function getDestinationPool(input: {
  scope: 'near' | 'country';
  lat?: number;
  lng?: number;
  poolKey?: string;
  lookahead?: number;
}): Promise<DestinationPoolResult> {
  if (input.poolKey) {
    // A "static:" key means an earlier request in this session was served the
    // fallback because generation hadn't finished yet — which is the norm on
    // a cold bucket, since generation takes far longer than the first-paint
    // race allows. Retry the real bucket rather than pinning the whole
    // session to the static catalog: upgrading mid-scroll is safe now that
    // pagination excludes already-seen ids instead of using a numeric offset,
    // so the switch appends unseen places rather than reshuffling the feed.
    const liveKey = input.poolKey.replace(/^static:/, '');
    const cached = peek<Destination[]>(liveKey);
    if (cached && cached.length > 0) {
      if (input.lookahead !== undefined && input.lookahead > 0) {
        void extendPool(liveKey, input.scope, input.lat, input.lng);
      }
      return { destinations: cached, fallback: false, poolKey: liveKey, canGrow: canGrow(liveKey) };
    }

    // Still nothing generated. Keep the generation going (or start it) so a
    // later scroll can upgrade, and serve the static catalog meanwhile —
    // reporting canGrow so the feed doesn't declare itself finished at 24
    // static places while real ones are minutes from being ready.
    void warmPool(liveKey, input.scope, input.lat, input.lng);
    return {
      destinations: withLiveImages(DESTINATIONS),
      fallback: true,
      poolKey: `static:${liveKey}`,
      canGrow: warmingPools.has(liveKey),
    };
  }

  const poolKey = poolKeyFor(input);
  const generation = warmPool(poolKey, input.scope, input.lat, input.lng);

  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), REQUEST_TIMEOUT_MS);
  });
  const superset = await Promise.race([generation, timeout]);

  if (superset && superset.length > 0) {
    return { destinations: superset, fallback: false, poolKey, canGrow: canGrow(poolKey) };
  }
  return {
    destinations: withLiveImages(DESTINATIONS),
    fallback: true,
    poolKey: `static:${poolKey}`,
    canGrow: warmingPools.has(poolKey),
  };
}

/** Awaitable pool top-up for a caller that has actually run out of
 *  destinations to serve and would otherwise have to answer "no more
 *  results". Bounded by `EXTENSION_WAIT_MS` so a slow or hung generation
 *  degrades to "nothing new *this* request" rather than hanging the response;
 *  the generation itself keeps running in the background either way, so the
 *  next scroll usually finds it already cached. Resolves to the pool as it
 *  stands afterwards — grown if the call landed in time, unchanged if not. */
export async function growDestinationPool(input: {
  poolKey: string;
  scope: 'near' | 'country';
  lat?: number;
  lng?: number;
}): Promise<DestinationPoolResult> {
  const liveKey = input.poolKey.replace(/^static:/, '');
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, EXTENSION_WAIT_MS));

  // On a bucket that has never generated, the thing worth waiting for is the
  // initial pool, not a top-up of a pool that doesn't exist yet.
  const pending = peek<Destination[]>(liveKey)
    ? extendPool(liveKey, input.scope, input.lat, input.lng)
    : warmPool(liveKey, input.scope, input.lat, input.lng).then(() => undefined, () => undefined);
  await Promise.race([pending, timeout]);

  const grown = peek<Destination[]>(liveKey);
  if (grown && grown.length > 0) {
    return { destinations: grown, fallback: false, poolKey: liveKey, canGrow: canGrow(liveKey) };
  }
  return {
    destinations: withLiveImages(DESTINATIONS),
    fallback: true,
    poolKey: `static:${liveKey}`,
    canGrow: warmingPools.has(liveKey),
  };
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
