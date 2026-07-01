import { Router } from 'express';
import { BUDGET_RANGES, MOODS } from '../../src/data/constants';
import type { TradeOffMode } from '../../src/types/types';
import { buildBaseRecommendations } from '../lib/recommend';
import { generateWhyThisFits, isGeminiConfigured } from '../services/gemini';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const mood: string | null = req.body?.mood ?? null;
    const budgetId: string | null = req.body?.budgetId ?? null;
    const tradeOff: TradeOffMode = req.body?.tradeOff ?? 'balanced';

    const budget = budgetId ? (BUDGET_RANGES.find((b) => b.id === budgetId) ?? null) : null;
    const moodLabel = mood ? (MOODS.find((m) => m.id === mood)?.label ?? mood) : 'a great trip';

    const base = buildBaseRecommendations({ mood, budget, tradeOff });

    const recommendations = await Promise.all(
      base.map(async (r) => {
        const monthData =
          r.destination.monthlyData.find((m) => m.month === r.month) ?? r.destination.monthlyData[0];
        const aiReason = await generateWhyThisFits(r.destination, moodLabel, monthData);
        return { ...r, aiReason };
      }),
    );

    res.json({ recommendations, fallback: !isGeminiConfigured() });
  } catch (err) {
    console.error('POST /api/recommendations failed:', err);
    res.status(500).json({ error: 'Failed to build recommendations' });
  }
});

export default router;
