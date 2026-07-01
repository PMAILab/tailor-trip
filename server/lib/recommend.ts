import { DESTINATIONS, MONTH_LABELS } from '../../src/data/constants';
import type {
  BudgetRange,
  CostBreakdown,
  CrowdLevel,
  Destination,
  MonthlyData,
  TimingInsight,
  TradeOffMode,
  TripRecommendation,
} from '../../src/types/types';

const CROWD_RANK: Record<CrowdLevel, number> = { Low: 0, Medium: 1, High: 2 };

/** Months a destination is realistically visitable (cost 0 means closed). */
function accessibleMonths(d: Destination): MonthlyData[] {
  const open = d.monthlyData.filter((m) => m.estimatedCost > 0);
  return open.length > 0 ? open : d.monthlyData;
}

export function cheapestMonthData(d: Destination): MonthlyData {
  return accessibleMonths(d).reduce((a, b) => (b.estimatedCost < a.estimatedCost ? b : a));
}

export function leastCrowdedMonthData(d: Destination): MonthlyData {
  return accessibleMonths(d).reduce((a, b) => {
    if (CROWD_RANK[b.crowdLevel] !== CROWD_RANK[a.crowdLevel]) {
      return CROWD_RANK[b.crowdLevel] < CROWD_RANK[a.crowdLevel] ? b : a;
    }
    return b.estimatedCost < a.estimatedCost ? b : a; // tie-break on price
  });
}

function monthScore(m: MonthlyData, months: MonthlyData[]): number {
  const costs = months.map((x) => x.estimatedCost);
  const min = Math.min(...costs);
  const max = Math.max(...costs);
  const priceScore = max === min ? 1 : 1 - (m.estimatedCost - min) / (max - min);
  const crowdScore = 1 - CROWD_RANK[m.crowdLevel] / 2;
  const weatherScore =
    m.weather === 'Pleasant' ? 1 : m.weather === 'Cold' ? 0.6 : m.weather === 'Hot' ? 0.4 : 0.3;
  return priceScore * 0.45 + crowdScore * 0.35 + weatherScore * 0.2;
}

export function pickMonth(d: Destination, tradeOff: TradeOffMode): MonthlyData {
  if (tradeOff === 'cheapest') return cheapestMonthData(d);
  if (tradeOff === 'least_crowded') return leastCrowdedMonthData(d);
  const months = accessibleMonths(d);
  return months.reduce((best, m) => (monthScore(m, months) > monthScore(best, months) ? m : best));
}

export function buildCostBreakdown(total: number): CostBreakdown {
  const travel = Math.round(total * 0.4);
  const stay = Math.round(total * 0.35);
  const foodAndExperiences = total - travel - stay;
  return { travel, stay, foodAndExperiences, total, perPerson: Math.round(total / 2) };
}

export function buildTimingInsight(d: Destination, chosen: MonthlyData): TimingInsight {
  const cheap = cheapestMonthData(d);
  const quiet = leastCrowdedMonthData(d);
  const monthlyPrices = Array.from({ length: 12 }, (_, i) => {
    const md = d.monthlyData.find((m) => m.month === i + 1);
    return md ? md.estimatedCost : 0;
  });
  return {
    cheapestMonth: cheap.month,
    leastCrowdedMonth: quiet.month,
    crowdLevel: chosen.crowdLevel,
    weather: chosen.weather,
    monthlyPrices,
  };
}

function scoreMatch(
  d: Destination,
  mood: string | null,
  chosen: MonthlyData,
  budget: BudgetRange | null,
): number {
  let score = 60;
  if (mood && d.moods.includes(mood)) score += 18;
  score += (2 - CROWD_RANK[chosen.crowdLevel]) * 5;
  if (chosen.weather === 'Pleasant') score += 8;
  if (budget) {
    if (chosen.estimatedCost <= budget.max && chosen.estimatedCost >= budget.min) score += 10;
    else if (chosen.estimatedCost <= budget.max) score += 6;
    else score -= 12;
  }
  return Math.max(35, Math.min(99, Math.round(score)));
}

function buildBadges(chosen: MonthlyData, timing: TimingInsight): string[] {
  const out = [`Cheapest in ${MONTH_LABELS[timing.cheapestMonth - 1]}`, `${chosen.crowdLevel} crowd`];
  if (chosen.weather === 'Pleasant') out.push('Great weather');
  return out;
}

export interface RecoOptions {
  mood: string | null;
  budget: BudgetRange | null;
  tradeOff: TradeOffMode;
  limit?: number;
}

/** Build one destination's recommendation (no AI copy — added by the route). */
export function buildBaseReco(
  d: Destination,
  opts: { mood: string | null; budget: BudgetRange | null; tradeOff: TradeOffMode },
): Omit<TripRecommendation, 'aiReason'> {
  const chosen = pickMonth(d, opts.tradeOff);
  const timing = buildTimingInsight(d, chosen);
  return {
    destination: d,
    month: chosen.month,
    costBreakdown: buildCostBreakdown(chosen.estimatedCost),
    timingInsight: timing,
    matchScore: scoreMatch(d, opts.mood, chosen, opts.budget),
    badges: buildBadges(chosen, timing),
  };
}

/** Ranked recommendations without AI copy (added by the route). */
export function buildBaseRecommendations({
  mood,
  budget,
  tradeOff,
  limit = 9,
}: RecoOptions): Omit<TripRecommendation, 'aiReason'>[] {
  const pool = mood ? DESTINATIONS.filter((d) => d.moods.includes(mood)) : DESTINATIONS;

  const recos = pool.map((d) => buildBaseReco(d, { mood, budget, tradeOff }));

  let filtered = recos;
  if (budget) {
    const within = recos.filter((r) => r.costBreakdown.total <= budget.max);
    if (within.length > 0) filtered = within;
  }

  filtered.sort(
    (a, b) => b.matchScore - a.matchScore || a.costBreakdown.total - b.costBreakdown.total,
  );
  return filtered.slice(0, limit);
}
