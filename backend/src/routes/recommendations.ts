import { Router } from 'express';
import { BUDGET_RANGES, DESTINATIONS, MOODS } from '../../src/data/constants';
import type { TradeOffMode } from '../../src/types/types';
import { buildBaseRecommendations } from '../../src/lib/recommend';
import { getDestinationPool, withLiveImages } from '../lib/destinationPool';
import { getWhyThisFitsBatch, isGeminiConfigured } from '../services/gemini';

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
    const page: number = Number.isInteger(req.body?.page) && req.body.page >= 0 ? req.body.page : 0;
    const poolKey: string | undefined = typeof req.body?.poolKey === 'string' ? req.body.poolKey : undefined;
    const offset = page * PAGE_SIZE;

    const budget = budgetId ? (BUDGET_RANGES.find((b) => b.id === budgetId) ?? null) : null;
    const moodLabel = mood ? (MOODS.find((m) => m.id === mood)?.label ?? mood) : 'a great trip';
    // Only meaningful for "near me" — browsing all of India has no anchor
    // point to sort distance from, so this stays undefined for scope=country.
    const userCoords = scope === 'near' && lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

    const poolResult = await getDestinationPool({ scope, lat, lng, poolKey });
    let recoPage = buildBaseRecommendations({
      mood,
      budget,
      tradeOff,
      pool: poolResult.destinations,
      offset,
      limit: PAGE_SIZE,
      userCoords,
    });
    let usedStaticPool = poolResult.fallback;
    let resolvedPoolKey = poolResult.poolKey;

    // The AI pool is a small, location-specific slice — if this mood/budget
    // combination happens to empty it out on the very first page, fall back
    // to the static catalog (which reliably covers all moods) instead of
    // showing nothing. Only on page 0: for page > 0, an empty result just
    // means "reached the end of this pool," which hasMore already reflects.
    if (page === 0 && recoPage.total === 0 && !poolResult.fallback) {
      recoPage = buildBaseRecommendations({
        mood,
        budget,
        tradeOff,
        pool: withLiveImages(DESTINATIONS),
        offset,
        limit: PAGE_SIZE,
        userCoords,
      });
      usedStaticPool = true;
      resolvedPoolKey = `static:${poolResult.poolKey}`;
    }

    // One Gemini call for every cache-missed card on this page, not one call
    // per card — the free-tier daily quota can't sustain 10 calls per load.
    const reasonInputs = recoPage.items.map((r) => ({
      id: r.destination.id,
      destination: r.destination,
      monthData: r.destination.monthlyData.find((m) => m.month === r.month) ?? r.destination.monthlyData[0],
    }));
    const reasons = await getWhyThisFitsBatch(reasonInputs, moodLabel);
    const recommendations = recoPage.items.map((r) => ({ ...r, aiReason: reasons[r.destination.id] }));

    // One boolean covers two independent signals (curated-vs-personalized
    // destination pool, and templated-vs-AI blurb copy) — a deliberate
    // simplification for now; split it if the UI ever needs to tell them apart.
    res.json({
      recommendations,
      fallback: usedStaticPool || !isGeminiConfigured(),
      hasMore: offset + recoPage.items.length < recoPage.total,
      poolKey: resolvedPoolKey,
    });
  } catch (err) {
    console.error('POST /api/recommendations failed:', err);
    res.status(500).json({ error: 'Failed to build recommendations' });
  }
});

export default router;
