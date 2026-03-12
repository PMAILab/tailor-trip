import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';
import type { Destination, MonthlyData, CostBreakdown, TimingInsight, CrowdLevel, WeatherType } from '../../src/types/types';

const router = Router();

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tradeOff = (req.query.tradeOff as string) || 'balanced';
    const db = getDb();

    const row = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id) as any;
    if (!row) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    const destination: Destination = {
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

    const monthlyRows = db.prepare(
      'SELECT * FROM monthly_data WHERE destination_id = ? ORDER BY month'
    ).all(id) as any[];

    const monthlyData: MonthlyData[] = monthlyRows.map((m: any) => ({
      month: m.month,
      estimatedCost: m.estimated_cost,
      crowdLevel: m.crowd_level as CrowdLevel,
      weather: m.weather as WeatherType,
    }));

    destination.monthlyData = monthlyData;

    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = monthlyData.find(m => m.month === currentMonth) || monthlyData[0];

    // Find recommended month based on trade-off
    const accessibleMonths = monthlyData.filter(m => m.estimatedCost > 0);
    let recommendedMonth: MonthlyData;

    if (tradeOff === 'cheapest') {
      recommendedMonth = accessibleMonths.reduce((min, m) =>
        m.estimatedCost < min.estimatedCost ? m : min, accessibleMonths[0]);
    } else if (tradeOff === 'least_crowded') {
      const crowdOrder = { Low: 0, Medium: 1, High: 2 };
      recommendedMonth = accessibleMonths.reduce((best, m) =>
        crowdOrder[m.crowdLevel] < crowdOrder[best.crowdLevel] ? m : best, accessibleMonths[0]);
    } else {
      // Balanced: composite score
      recommendedMonth = accessibleMonths.reduce((best, m) => {
        const score = (20000 - m.estimatedCost) / 200 +
          (m.crowdLevel === 'Low' ? 30 : m.crowdLevel === 'Medium' ? 15 : 0) +
          (m.weather === 'Pleasant' ? 20 : m.weather === 'Cold' ? 10 : 0);
        const bestScore = (20000 - best.estimatedCost) / 200 +
          (best.crowdLevel === 'Low' ? 30 : best.crowdLevel === 'Medium' ? 15 : 0) +
          (best.weather === 'Pleasant' ? 20 : best.weather === 'Cold' ? 10 : 0);
        return score > bestScore ? m : best;
      }, accessibleMonths[0]);
    }

    const total = currentMonthData.estimatedCost;
    const costBreakdown: CostBreakdown = {
      travel: Math.round(total * 0.35),
      stay: Math.round(total * 0.40),
      foodAndExperiences: total - Math.round(total * 0.35) - Math.round(total * 0.40),
      total,
      perPerson: total,
    };

    const cheapestMonth = accessibleMonths.reduce((min, m) =>
      m.estimatedCost < min.estimatedCost ? m : min, accessibleMonths[0]);

    const timingInsight: TimingInsight = {
      cheapestMonth: cheapestMonth.month,
      crowdLevel: currentMonthData.crowdLevel,
      weather: currentMonthData.weather,
      monthlyPrices: monthlyData.map(m => m.estimatedCost),
    };

    res.json({
      destination,
      costBreakdown,
      timingInsight,
      recommendedMonth: recommendedMonth.month,
      recommendedMonthData: recommendedMonth,
    });
  } catch (err) {
    console.error('Trip detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
