import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';
import { generateWhyThisFits } from '../services/gemini';
import { MOODS } from '../../src/data/constants';
import type { Destination, MonthlyData, CostBreakdown, TimingInsight, TripRecommendation, CrowdLevel, WeatherType } from '../../src/types/types';

const router = Router();

interface RecommendationBody {
  mood: string;
  budgetRange?: { min: number; max: number };
  tradeOff?: 'cheapest' | 'least_crowded' | 'balanced';
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { mood, budgetRange, tradeOff = 'balanced' } = req.body as RecommendationBody;
    if (!mood) {
      res.status(400).json({ error: 'mood is required' });
      return;
    }

    const db = getDb();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Get all destinations matching the mood
    const allDests = db.prepare('SELECT * FROM destinations').all() as any[];
    const matchedDests = allDests.filter((d: any) => {
      const moods: string[] = JSON.parse(d.moods);
      return moods.includes(mood);
    });

    if (matchedDests.length === 0) {
      res.json({ recommendations: [], fallback: true });
      return;
    }

    // Build recommendations with scoring
    const recommendations: TripRecommendation[] = [];

    for (const row of matchedDests) {
      const dest = rowToDestination(row);
      const monthlyRows = db.prepare(
        'SELECT * FROM monthly_data WHERE destination_id = ? ORDER BY month'
      ).all(dest.id) as any[];

      const monthlyData: MonthlyData[] = monthlyRows.map((m: any) => ({
        month: m.month,
        estimatedCost: m.estimated_cost,
        crowdLevel: m.crowd_level as CrowdLevel,
        weather: m.weather as WeatherType,
      }));

      const currentMonthData = monthlyData.find(m => m.month === currentMonth);
      if (!currentMonthData) continue;

      // Budget filter
      if (budgetRange) {
        if (currentMonthData.estimatedCost < budgetRange.min || currentMonthData.estimatedCost > budgetRange.max) {
          continue;
        }
      }

      // Skip destinations with 0 cost (inaccessible this month)
      if (currentMonthData.estimatedCost === 0) continue;

      // Scoring
      const score = computeScore(currentMonthData, tradeOff, dest.moods, mood);
      const cheapestMonth = monthlyData
        .filter(m => m.estimatedCost > 0)
        .reduce((min, m) => m.estimatedCost < min.estimatedCost ? m : min, monthlyData[0]);

      const costBreakdown = estimateCostBreakdown(currentMonthData.estimatedCost);
      const monthlyPrices = monthlyData.map(m => m.estimatedCost);

      const timingInsight: TimingInsight = {
        cheapestMonth: cheapestMonth.month,
        crowdLevel: currentMonthData.crowdLevel,
        weather: currentMonthData.weather,
        monthlyPrices,
      };

      // Badges
      const badges: string[] = [];
      if (currentMonthData.crowdLevel === 'Low') badges.push('Low Crowd');
      if (cheapestMonth.month === currentMonth) badges.push('Cheapest Now');
      if (currentMonthData.weather === 'Pleasant') badges.push('Great Weather');
      if (score >= 85) badges.push('Top Pick');

      recommendations.push({
        destination: { ...dest, monthlyData },
        costBreakdown,
        timingInsight,
        matchScore: score,
        aiReason: '', // filled below
        badges,
      });
    }

    // Sort by score descending, take top 8
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const topRecs = recommendations.slice(0, 8);

    // Generate AI reasons
    const moodObj = MOODS.find(m => m.id === mood);
    const moodLabel = moodObj?.label || mood;

    await Promise.all(
      topRecs.map(async (rec) => {
        const currentMonthData = rec.destination.monthlyData.find(m => m.month === currentMonth);
        if (currentMonthData) {
          rec.aiReason = await generateWhyThisFits(rec.destination, moodLabel, currentMonthData);
        }
      })
    );

    res.json({ recommendations: topRecs });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function computeScore(
  monthData: MonthlyData,
  tradeOff: string,
  destMoods: string[],
  selectedMood: string
): number {
  // Budget score: lower cost = higher score (normalize against 20000 max)
  const budgetScore = Math.max(0, 100 - (monthData.estimatedCost / 200));

  // Crowd score
  const crowdMap = { Low: 100, Medium: 60, High: 30 };
  const crowdScore = crowdMap[monthData.crowdLevel] || 50;

  // Weather score
  const weatherMap = { Pleasant: 100, Cold: 60, Hot: 40, Rainy: 20 };
  const weatherScore = weatherMap[monthData.weather] || 50;

  // Mood match score
  const moodScore = destMoods.includes(selectedMood) ? 100 : 40;

  // Weighted by trade-off
  switch (tradeOff) {
    case 'cheapest':
      return Math.round(budgetScore * 0.5 + crowdScore * 0.1 + weatherScore * 0.1 + moodScore * 0.3);
    case 'least_crowded':
      return Math.round(budgetScore * 0.1 + crowdScore * 0.5 + weatherScore * 0.1 + moodScore * 0.3);
    default: // balanced
      return Math.round(budgetScore * 0.25 + crowdScore * 0.25 + weatherScore * 0.2 + moodScore * 0.3);
  }
}

function estimateCostBreakdown(total: number): CostBreakdown {
  const travel = Math.round(total * 0.35);
  const stay = Math.round(total * 0.40);
  const food = total - travel - stay;
  return { travel, stay, foodAndExperiences: food, total, perPerson: total };
}

function rowToDestination(row: any): Destination {
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    heroImages: JSON.parse(row.hero_images),
    sentiment: JSON.parse(row.sentiment),
    description: row.description,
    moods: JSON.parse(row.moods),
    durationDays: row.duration_days,
    monthlyData: [],
  };
}

export default router;
