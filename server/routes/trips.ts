import { Router, type Request, type Response } from 'express';
import { supabase } from '../db';
import type {
  Destination,
  MonthlyData,
  CostBreakdown,
  TimingInsight,
  CrowdLevel,
  WeatherType,
} from '../../src/types/types';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tradeOff = (req.query.tradeOff as string) || 'balanced';

    // Fetch destination
    const { data: row, error: destErr } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single();

    if (destErr || !row) {
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

    // Fetch monthly data
    const { data: monthlyRows, error: mErr } = await supabase
      .from('monthly_data')
      .select('*')
      .eq('destination_id', id)
      .order('month');

    if (mErr) throw new Error(mErr.message);

    const monthlyData: MonthlyData[] = (monthlyRows ?? []).map((m: any) => ({
      month: m.month,
      estimatedCost: m.estimated_cost,
      crowdLevel: m.crowd_level as CrowdLevel,
      weather: m.weather as WeatherType,
    }));

    destination.monthlyData = monthlyData;

    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = monthlyData.find((m) => m.month === currentMonth) ?? monthlyData[0];

    const accessibleMonths = monthlyData.filter((m) => m.estimatedCost > 0);
    let recommendedMonth: MonthlyData;

    if (tradeOff === 'cheapest') {
      recommendedMonth = accessibleMonths.reduce((min, m) =>
        m.estimatedCost < min.estimatedCost ? m : min, accessibleMonths[0]);
    } else if (tradeOff === 'least_crowded') {
      const crowdOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
      recommendedMonth = accessibleMonths.reduce((best, m) =>
        crowdOrder[m.crowdLevel] < crowdOrder[best.crowdLevel] ? m : best, accessibleMonths[0]);
    } else {
      recommendedMonth = accessibleMonths.reduce((best, m) => {
        const score =
          (20000 - m.estimatedCost) / 200 +
          (m.crowdLevel === 'Low' ? 30 : m.crowdLevel === 'Medium' ? 15 : 0) +
          (m.weather === 'Pleasant' ? 20 : m.weather === 'Cold' ? 10 : 0);
        const bestScore =
          (20000 - best.estimatedCost) / 200 +
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
      monthlyPrices: monthlyData.map((m) => m.estimatedCost),
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
