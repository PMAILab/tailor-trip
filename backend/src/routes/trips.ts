import { Router } from 'express';
import { BUDGET_RANGES } from '../data/constants.js';
import type { Destination, MonthlyData, TradeOffMode } from '../types/types.js';
import {
  buildBaseReco,
  buildCostBreakdown,
  buildTimingInsight,
  cheapestMonthData,
  leastCrowdedMonthData,
} from '../lib/recommend.js';
import { getDestinationById } from '../lib/destinationPool.js';
import { getTripSummaryBatch, isGeminiConfigured } from '../services/gemini.js';

const router = Router();

function optionFor(dest: Destination, md: MonthlyData) {
  return {
    month: md.month,
    costBreakdown: buildCostBreakdown(md.estimatedCost),
    timingInsight: buildTimingInsight(dest, md),
  };
}

// Compact recommendations for a set of saved ids (shortlist, compare).
router.post('/summary', async (req, res) => {
  const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const mood: string | null = req.body?.mood ?? null;
  const budgetId: string | null = req.body?.budgetId ?? null;
  const tradeOff: TradeOffMode = req.body?.tradeOff ?? 'balanced';
  const budget = budgetId ? (BUDGET_RANGES.find((b) => b.id === budgetId) ?? null) : null;

  const found = (await Promise.all(ids.map((id) => getDestinationById(id)))).filter(
    (d): d is Destination => Boolean(d),
  );

  const bases = found.map((d) => buildBaseReco(d, { mood, budget, tradeOff }));
  const summaryInputs = bases.map((base) => ({
    id: base.destination.id,
    destination: base.destination,
    monthData: base.destination.monthlyData.find((m) => m.month === base.month) ?? base.destination.monthlyData[0],
  }));
  const summaries = await getTripSummaryBatch(summaryInputs);
  const recommendations = bases.map((base) => ({ ...base, aiReason: summaries[base.destination.id] }));

  res.json({ recommendations });
});

router.get('/:id', async (req, res) => {
  const dest = await getDestinationById(req.params.id);
  if (!dest) {
    res.status(404).json({ error: 'Destination not found' });
    return;
  }

  const cheapMd = cheapestMonthData(dest);
  const quietMd = leastCrowdedMonthData(dest);
  const summaries = await getTripSummaryBatch([{ id: dest.id, destination: dest, monthData: cheapMd }]);
  const aiReason = summaries[dest.id];

  res.json({
    destination: dest,
    options: {
      cheapest: optionFor(dest, cheapMd),
      least_crowded: optionFor(dest, quietMd),
    },
    aiReason,
    fallback: !isGeminiConfigured(),
  });
});

export default router;
