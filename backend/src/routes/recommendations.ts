import { Router } from 'express';
import { BUDGET_RANGES, DESTINATIONS, MOODS } from '../data/constants.js';
import type { TradeOffMode } from '../types/types.js';
import { buildBaseRecommendations } from '../lib/recommend.js';
import { getDestinationPool, growDestinationPool, withLiveImages } from '../lib/destinationPool.js';
import { getWhyThisFitsBatch, isGeminiConfigured } from '../services/gemini.js';

const router = Router();

const PAGE_SIZE = 10;

router.post('/', async (req, res) => {
  try {
    const mood: string | null = req.body?.mood ?? null;
    const budgetId: string | null = req.body?.budgetId ?? null;
    const tradeOff: TradeOffMode = req.body?.tradeOff ?? 'balanced';
    const scope: 'near' | 'country' = req.body?.scope === 'near' ? 'near' : 'country';
    const lat: number | undefined = Number.isFinite(req.body?.lat) ? req.body.lat : undefined;
    const lng: number | undefined = Number.isFinite(req.body?.lng) ? req.body.lng : undefined;
    const poolKey: string | undefined = typeof req.body?.poolKey === 'string' ? req.body.poolKey : undefined;
    // Ids the client already has on screen. This, not a page number, is what
    // drives pagination: the pool grows as the user scrolls (AI top-ups) and
    // is re-scored on every request, so a numeric offset into it would skip
    // destinations and repeat others as the ordering shifts underneath.
    const seenIds: string[] = Array.isArray(req.body?.seenIds)
      ? req.body.seenIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];
    const isFirstPage = seenIds.length === 0;

    const budget = budgetId ? (BUDGET_RANGES.find((b) => b.id === budgetId) ?? null) : null;
    const moodLabel = mood ? (MOODS.find((m) => m.id === mood)?.label ?? mood) : 'a great trip';
    // Only meaningful for "near me" — browsing all of India has no anchor
    // point to sort distance from, so this stays undefined for scope=country.
    const userCoords = scope === 'near' && lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

    const buildPage = (pool: Parameters<typeof buildBaseRecommendations>[0]['pool']) =>
      buildBaseRecommendations({ mood, budget, tradeOff, pool, excludeIds: seenIds, limit: PAGE_SIZE, userCoords });

    // A non-zero lookahead asks the pool to start topping itself up in the
    // background now, so the *next* scroll usually finds new places already
    // cached rather than waiting on a generation.
    let poolResult = await getDestinationPool({ scope, lat, lng, poolKey, lookahead: isFirstPage ? 0 : PAGE_SIZE });
    let recoPage = buildPage(poolResult.destinations);
    let usedStaticPool = poolResult.fallback;
    let resolvedPoolKey = poolResult.poolKey;

    // Ran out of unseen destinations, but this bucket can still grow: wait for
    // it rather than reporting "no more results" — the latter is permanent,
    // since the frontend drops its scroll sentinel on it. This is what keeps
    // scrolling productive past the initial generated batch; it covers the
    // case where a narrow mood/budget filters the pool down to far fewer
    // matches than it holds, and the case where the user has exhausted the
    // static placeholder while the first real generation is still running.
    if (recoPage.items.length === 0 && poolResult.canGrow) {
      poolResult = await growDestinationPool({ poolKey: resolvedPoolKey, scope, lat, lng });
      recoPage = buildPage(poolResult.destinations);
      usedStaticPool = poolResult.fallback;
      resolvedPoolKey = poolResult.poolKey;
    }

    // The AI pool is a small, location-specific slice — if this mood/budget
    // combination happens to empty it out on the very first page, fall back
    // to the static catalog (which reliably covers all moods) instead of
    // showing nothing. Only on the first page: later on, an empty result just
    // means "reached the end of this pool," which hasMore already reflects.
    if (isFirstPage && recoPage.items.length === 0 && !usedStaticPool) {
      recoPage = buildPage(withLiveImages(DESTINATIONS));
      usedStaticPool = true;
      resolvedPoolKey = `static:${poolResult.poolKey}`;
    }

    // One Gemini call for every cache-missed card on this page, not one call
    // per card — 10 calls per load would be needlessly slow and expensive.
    const reasonInputs = recoPage.items.map((r) => ({
      id: r.destination.id,
      destination: r.destination,
      monthData: r.destination.monthlyData.find((m) => m.month === r.month) ?? r.destination.monthlyData[0],
    }));
    const reasons = await getWhyThisFitsBatch(reasonInputs, moodLabel);
    const recommendations = recoPage.items.map((r) => ({ ...r, aiReason: reasons[r.destination.id] }));

    // hasMore stays true while the pool could still grow, not just while this
    // response's snapshot of it has unseen matches left — otherwise the feed
    // ends the moment the current batch is used up, even though more places
    // are only a generation away. canGrow covers both an AI pool that can be
    // topped up and a static placeholder whose real pool is still generating.
    //
    // This deliberately allows an empty page with hasMore: true, meaning
    // "nothing new *yet*, ask again shortly" — a generation that outran the
    // wait above is the common case, and answering false there would end the
    // feed permanently. The client backs off before retrying (see Explore).
    const hasMore = recoPage.remaining > 0 || poolResult.canGrow;

    // One boolean covers two independent signals (curated-vs-personalized
    // destination pool, and templated-vs-AI blurb copy) — a deliberate
    // simplification for now; split it if the UI ever needs to tell them apart.
    res.json({
      recommendations,
      fallback: usedStaticPool || !isGeminiConfigured(),
      hasMore,
      poolKey: resolvedPoolKey,
    });
  } catch (err) {
    console.error('POST /api/recommendations failed:', err);
    res.status(500).json({ error: 'Failed to build recommendations' });
  }
});

export default router;
