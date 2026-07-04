import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { getRecommendations, buildLocalRecommendations, type RecommendationsParams } from '../lib/api';
import type { TripRecommendation } from '../types/types';
import { MOODS } from '../data/constants';
import TripCard from '../components/TripCard';
import SkeletonCard from '../components/SkeletonCard';
import TrustLoadingLine from '../components/TrustLoadingLine';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Icon from '../components/Icon';

// No 'error' state: an unreachable API always falls back to the local
// catalog (see `load` below), so this feed never has anything to show an
// error for — the worst case is genuinely empty local results, handled by
// the empty state below.
type Status = 'loading' | 'done';

// How long the initial request is given before falling back to the local
// catalog — short enough that a cold Render instance never leaves the user
// staring at skeleton cards; the background retries below give it the rest
// of its wake-up time to respond for real.
const FIRST_ATTEMPT_TIMEOUT_MS = 4000;
const BACKGROUND_RETRY_INTERVAL_MS = 5000;
const BACKGROUND_RETRY_TIMEOUT_MS = 15000;
const MAX_BACKGROUND_RETRIES = 20; // ~100s total, comfortably past a Render free-tier cold start

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

export default function Explore() {
  const {
    selectedMood,
    selectedBudget,
    tradeOff,
    setBudget,
    locationScope,
    locationStatus,
    coords,
    locationLabel,
    requestLocation,
    browseAllOfIndia,
  } = useApp();
  const [recs, setRecs] = useState<TripRecommendation[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [page, setPage] = useState(0);
  const [poolKey, setPoolKey] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Cancels a still-running background retry loop when a newer search
  // supersedes it (mood/budget/location changed, or the component unmounts)
  // — otherwise a slow-to-arrive stale response could clobber fresh results.
  const retryAbortRef = useRef<AbortController | null>(null);

  // Keeps polling the live API in the background after the local fallback is
  // already on screen, and swaps the real data in the moment it responds —
  // no loading state, no flicker, nothing for the user to notice.
  const retryInBackground = useCallback(async (params: RecommendationsParams, signal: AbortSignal) => {
    for (let attempt = 0; attempt < MAX_BACKGROUND_RETRIES && !signal.aborted; attempt++) {
      await sleep(BACKGROUND_RETRY_INTERVAL_MS, signal);
      if (signal.aborted) return;
      try {
        const res = await getRecommendations(params, { signal, timeoutMs: BACKGROUND_RETRY_TIMEOUT_MS });
        if (signal.aborted) return;
        setRecs(res.recommendations);
        setPoolKey(res.poolKey);
        setHasMore(Boolean(res.hasMore));
        return;
      } catch {
        // Still waking up — loop and try again.
      }
    }
  }, []);

  // A new mood/budget/tradeOff/location combination is a fresh search —
  // reset to page 0 rather than append onto results from a different query.
  const load = useCallback(async () => {
    retryAbortRef.current?.abort();
    setPage(0);
    setHasMore(false);

    const params: RecommendationsParams = {
      mood: selectedMood,
      budgetId: selectedBudget?.id ?? null,
      tradeOff,
      scope: locationScope,
      lat: coords?.lat,
      lng: coords?.lng,
      page: 0,
    };

    // Skeleton cards only show up if the local fallback itself is empty
    // (e.g. this mood/budget has no match in the static catalog either) —
    // otherwise the feed goes straight from nothing to real content.
    setStatus('loading');
    try {
      const res = await getRecommendations(params, { timeoutMs: FIRST_ATTEMPT_TIMEOUT_MS });
      setRecs(res.recommendations);
      setPoolKey(res.poolKey);
      setHasMore(Boolean(res.hasMore));
      setStatus('done');
    } catch {
      // API unreachable (most likely a cold-starting Render instance) —
      // show real, correctly-scored trips from the local catalog right
      // away instead of an error or a long spinner.
      setRecs(buildLocalRecommendations(params));
      setPoolKey(undefined);
      setHasMore(false);
      setStatus('done');

      const controller = new AbortController();
      retryAbortRef.current = controller;
      void retryInBackground(params, controller.signal);
    }
  }, [selectedMood, selectedBudget, tradeOff, locationScope, coords, retryInBackground]);

  useEffect(() => {
    void load();
    return () => retryAbortRef.current?.abort();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || status !== 'done') return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await getRecommendations({
        mood: selectedMood,
        budgetId: selectedBudget?.id ?? null,
        tradeOff,
        scope: locationScope,
        lat: coords?.lat,
        lng: coords?.lng,
        page: nextPage,
        poolKey,
      });
      setRecs((prev) => [...prev, ...res.recommendations]);
      setPage(nextPage);
      setHasMore(Boolean(res.hasMore));
    } catch {
      // A failed "load more" shouldn't wipe the results already on screen —
      // just stop offering more so the user can retry by scrolling again later.
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, status, page, poolKey, selectedMood, selectedBudget, tradeOff, locationScope, coords]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const moodLabel = selectedMood ? MOODS.find((m) => m.id === selectedMood)?.label : null;
  const tradeOffLabel =
    tradeOff === 'cheapest' ? 'sorted by price' : tradeOff === 'least_crowded' ? 'sorted by crowd' : null;
  const moodArticle = moodLabel && /^[aeiou]/i.test(moodLabel) ? 'an' : 'a';
  const subtitle = moodLabel
    ? `Because you are in ${moodArticle} ${moodLabel.toLowerCase()} mood`
    : 'A handpicked mix to get you started';

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-10">
        <h1 className="mb-2 font-display text-headline-md text-primary">Curated escapes</h1>
        <p className="text-body-md text-on-surface-variant">
          {subtitle}
          {selectedBudget ? `, within ${selectedBudget.label.toLowerCase()}` : ''}
          {tradeOffLabel ? `, ${tradeOffLabel}` : ''}.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationStatus === 'pending'}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-body-sm transition-colors disabled:opacity-60 ${
              locationScope === 'near' && locationStatus === 'granted'
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-primary'
            }`}
          >
            <Icon name="my_location" className="text-[16px]" />
            {locationStatus === 'pending' ? 'Finding you…' : 'Near me'}
          </button>
          <button
            type="button"
            onClick={browseAllOfIndia}
            className={`rounded-full border px-4 py-2 text-body-sm transition-colors ${
              locationScope === 'country'
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-primary'
            }`}
          >
            All of India
          </button>
          {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
            <p className="text-body-sm text-on-surface-variant">
              Location access isn&apos;t available — showing escapes from across India instead.
            </p>
          )}
        </div>
        {/* Confirms exactly where "near me" locked onto, so the ordering below is never a mystery. */}
        {locationScope === 'near' && locationStatus === 'granted' && (
          <p className="flex items-center gap-1.5 text-body-sm text-accent" role="status">
            <Icon name="location_on" className="text-[16px]" />
            {locationLabel ? `Showing escapes near ${locationLabel}, closest first` : 'Locating you…'}
          </p>
        )}
      </div>

      {status === 'loading' && (
        <>
          <TrustLoadingLine />
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      )}

      {status === 'done' && recs.length === 0 && (
        <EmptyState
          icon="travel_explore"
          title="Nothing matched just yet"
          description="Try a different mood or widen your budget to see more escapes."
          action={
            selectedBudget ? (
              <Button variant="outline" onClick={() => setBudget(null)}>
                Clear budget
              </Button>
            ) : (
              <Link to="/discover">
                <Button variant="accent">Pick a mood</Button>
              </Link>
            )
          }
        />
      )}

      {status === 'done' && recs.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
            {recs.map((r) => (
              <TripCard key={r.destination.id} rec={r} />
            ))}
            {loadingMore &&
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`more-${i}`} />)}
          </div>
          {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />}
        </>
      )}
    </div>
  );
}
