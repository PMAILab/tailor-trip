import { Router } from 'express';
import { requireDb } from '../lib/supabaseClient.js';
import { requireUser } from '../middleware/requireUser.js';
import type { ItineraryDay, ItineraryInputs, SavedItinerary } from '../types/types.js';

const router = Router();
router.use(requireUser);

interface ItineraryRow {
  id: string;
  inputs: ItineraryInputs;
  days: ItineraryDay[];
  generated_at: string;
}

function toSavedItinerary(row: ItineraryRow): SavedItinerary {
  return { id: row.id, inputs: row.inputs, days: row.days, generatedAt: row.generated_at };
}

// Every query below filters by user_id explicitly — that filter, not the
// table's RLS policies, is the real security boundary here, since this
// route uses the service-role client (which bypasses RLS entirely).

router.get('/', async (req, res) => {
  const db = requireDb(res);
  if (!db) return;
  const { data, error } = await db
    .from('itineraries')
    .select('id, inputs, days, generated_at')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('GET /api/itineraries failed:', error);
    res.status(500).json({ error: 'Failed to load saved itineraries' });
    return;
  }
  res.json({ itineraries: (data as ItineraryRow[]).map(toSavedItinerary) });
});

router.post('/', async (req, res) => {
  const db = requireDb(res);
  if (!db) return;
  const inputs = req.body?.inputs as ItineraryInputs | undefined;
  const days = req.body?.days as ItineraryDay[] | undefined;
  if (!inputs || !Array.isArray(days) || days.length === 0) {
    res.status(400).json({ error: 'inputs and days are required' });
    return;
  }

  const { data, error } = await db
    .from('itineraries')
    .insert({ user_id: req.user!.id, inputs, days })
    .select('id, inputs, days, generated_at')
    .single();
  if (error || !data) {
    console.error('POST /api/itineraries failed:', error);
    res.status(500).json({ error: 'Failed to save itinerary' });
    return;
  }
  res.json({ itinerary: toSavedItinerary(data as ItineraryRow) });
});

export default router;
