import { Router } from 'express';
import { BUDGET_RANGES } from '../../src/data/constants';
import { generateItineraryDay, type ItineraryDayInput } from '../services/gemini';

const router = Router();

const MAX_DAYS = 7;

function budgetLabel(id: string | undefined): string {
  return BUDGET_RANGES.find((b) => b.id === id)?.label ?? 'a flexible budget';
}

function toInput(body: Record<string, unknown>): ItineraryDayInput {
  return {
    destination: String(body?.destination ?? '').trim() || 'your destination',
    partyType: String(body?.partyType ?? 'couple'),
    budgetLabel: budgetLabel(body?.budgetPerPerson as string | undefined),
    interests: Array.isArray(body?.interests) ? (body.interests as string[]) : [],
    dietary: String(body?.dietaryPreference ?? 'both'),
    pace: String(body?.pace ?? 'moderate'),
  };
}

function computeDays(body: Record<string, unknown>): number {
  const start = body?.startDate ? new Date(String(body.startDate)) : null;
  const end = body?.endDate ? new Date(String(body.endDate)) : null;
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    if (diff >= 1) return Math.min(MAX_DAYS, diff);
  }
  const dur = Number(body?.durationDays);
  return Math.min(MAX_DAYS, Number.isFinite(dur) && dur >= 1 ? dur : 3);
}

function dateForDay(startDate: string | undefined, dayNumber: number): string | undefined {
  if (!startDate) return undefined;
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setDate(d.getDate() + (dayNumber - 1));
  return d.toISOString().slice(0, 10);
}

// Stream the itinerary one day at a time as NDJSON.
router.post('/generate', async (req, res) => {
  const body = req.body ?? {};
  const input = toInput(body);
  const days = computeDays(body);

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');

  const priorTitles: string[] = [];
  try {
    for (let i = 1; i <= days; i += 1) {
      const day = await generateItineraryDay(input, i, dateForDay(body.startDate, i), priorTitles);
      if (day.title) priorTitles.push(day.title);
      res.write(`${JSON.stringify({ day })}\n`);
    }
  } catch (err) {
    console.error('POST /api/itinerary/generate failed:', err);
  }
  res.write(`${JSON.stringify({ done: true })}\n`);
  res.end();
});

// Regenerate a single day.
router.post('/regenerate-day', async (req, res) => {
  const body = req.body ?? {};
  const input = toInput(body);
  const dayNumber = Number(body?.dayNumber) || 1;
  const priorTitles: string[] = Array.isArray(body?.priorTitles) ? body.priorTitles : [];
  try {
    const day = await generateItineraryDay(
      input,
      dayNumber,
      dateForDay(body.startDate, dayNumber),
      priorTitles,
    );
    res.json({ day });
  } catch (err) {
    console.error('POST /api/itinerary/regenerate-day failed:', err);
    res.status(500).json({ error: 'Failed to regenerate day' });
  }
});

export default router;
