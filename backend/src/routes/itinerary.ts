import { Router } from 'express';
import { BUDGET_RANGES } from '../data/constants.js';
import { generateItineraryDay, generateItineraryBatch, type ItineraryDayInput } from '../services/gemini.js';

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

// Streams the itinerary one day at a time as NDJSON — but generates every
// day in a single Gemini call (see generateItineraryBatch) rather than one
// call per day, and fakes the progressive reveal by writing results to the
// stream with a small delay between them, so the client-visible UX is
// unchanged while the free-tier quota spend drops from up to 7 calls to 1.
router.post('/generate', async (req, res) => {
  const body = req.body ?? {};
  const input = toInput(body);
  const dayCount = computeDays(body);
  const dayList = Array.from({ length: dayCount }, (_, i) => ({
    dayNumber: i + 1,
    dateLabel: dateForDay(body.startDate, i + 1),
  }));

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const days = await generateItineraryBatch(input, dayList);
    for (const day of days) {
      res.write(`${JSON.stringify({ day })}\n`);
      await new Promise((r) => setTimeout(r, 200));
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
