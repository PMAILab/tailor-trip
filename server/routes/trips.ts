import { Router } from 'express';
import { DESTINATIONS } from '../../src/data/constants';
import type { Destination, MonthlyData } from '../../src/types/types';
import {
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
