// Tiny in-process caches. No cross-instance coherency and no persistence
// across restarts — fine for a single Express process where the only goal is
// "don't repeat the same slow AI/image call within a short window."

interface AsyncEntry<T> {
  promise: Promise<T>;
  expiresAt: number | null; // null while the promise is still in flight
  value?: T; // set once settled — lets peek() read it back synchronously
}

const asyncStore = new Map<string, AsyncEntry<unknown>>();

/** Returns the cached value for `key` if fresh; otherwise calls `fn()` once
 *  and caches the result for `ttlMs` (or `ttlMs(value)`, letting the caller
 *  give a short TTL to a "nothing came back" result — e.g. a quota-exhausted
 *  or transiently-failing AI call — instead of caching it as long as a real
 *  success, which would otherwise leave the feature looking "stuck off" for
 *  the full TTL after any blip). Concurrent calls for the same cold key
 *  share the same in-flight promise instead of each triggering their own
 *  `fn()` — important for expensive calls (Gemini, Unsplash) that many
 *  requests can land on at once. A rejected `fn()` evicts the key so the
 *  next call retries instead of caching the failure. */
export function getOrSet<T>(
  key: string,
  ttlMs: number | ((value: T) => number),
  fn: () => Promise<T>,
): Promise<T> {
  const existing = asyncStore.get(key) as AsyncEntry<T> | undefined;
  if (existing && (existing.expiresAt === null || existing.expiresAt > Date.now())) {
    return existing.promise;
  }

  const promise = fn();
  asyncStore.set(key, { promise, expiresAt: null });
  promise
    .then((value) => {
      const entry = asyncStore.get(key);
      if (entry && entry.promise === promise) {
        entry.value = value;
        entry.expiresAt = Date.now() + (typeof ttlMs === 'function' ? ttlMs(value) : ttlMs);
      }
    })
    .catch(() => {
      const entry = asyncStore.get(key);
      if (entry && entry.promise === promise) asyncStore.delete(key);
    });
  return promise;
}

/** Synchronous, no-regeneration read: returns the settled value for `key` if
 *  it's still fresh, or `undefined` otherwise (in flight, missing, or
 *  expired). Never triggers `fn()` — for callers that must reuse an exact
 *  previously-seen result (e.g. page 2 of a paginated list continuing from
 *  the same pool page 1 used) rather than risk a regenerated, different one. */
export function peek<T>(key: string): T | undefined {
  const entry = asyncStore.get(key) as AsyncEntry<T> | undefined;
  if (!entry || entry.expiresAt === null || entry.expiresAt <= Date.now()) return undefined;
  return entry.value;
}

/** Writes a value directly (no `fn()` call) — for batched work where the
 *  caller already computed several results at once (e.g. one Gemini call
 *  covering N cache-missed items) and wants to seed the cache for each item
 *  individually so a future single-item lookup is a hit. */
export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  asyncStore.set(key, { promise: Promise.resolve(value), value, expiresAt: Date.now() + ttlMs });
}

interface SyncEntry<T> {
  value: T;
  expiresAt: number;
}

/** A plain synchronous keyed store with TTL — for values that are produced
 *  as a side effect (e.g. "seed the by-id cache while building a pool") and
 *  read back with a synchronous now-or-never check, no dedup semantics needed. */
export class TtlStore<T> {
  private readonly map = new Map<string, SyncEntry<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
