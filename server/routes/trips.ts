import { Router } from 'express';
import { BUDGET_RANGES, DESTINATIONS } from '../../src/data/constants';
import type { Destination, MonthlyData, TradeOffMode } from '../../src/types/types';
import {
  buildBaseReco,
  buildCostBreakdown,
  buildTimingInsight,
  cheapestMonthData,
  leastCrowdedMonthData,
} from '../lib/recommend';
import { generateTripSummary, isGeminiConfigured } from '../services/gemini';

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

  const found = ids
    .map((id) => DESTINATIONS.find((d) => d.id === id))
    .filter((d): d is Destination => Boolean(d));

  const recommendations = await Promise.all(
    found.map(async (d) => {
      const base = buildBaseReco(d, { mood, budget, tradeOff });
      const md = d.monthlyData.find((m) => m.month === base.month) ?? d.monthlyData[0];
      const aiReason = await generateTripSummary(d, md);
      return { ...base, aiReason };
    }),
  );

  res.json({ recommendations });
});

router.get('/:id', async (req, res) => {
  const dest = DESTINATIONS.find((d) => d.id === req.params.id);
  if (!dest) {
    res.status(404).json({ error: 'Destination not found' });
    return;
  }

  const cheapMd = cheapestMonthData(dest);
  const quietMd = leastCrowdedMonthData(dest);
  const aiReason = await generateTripSummary(dest, cheapMd);

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
