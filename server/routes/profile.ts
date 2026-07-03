import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireUser } from '../middleware/requireUser';
import { MOODS, BUDGET_RANGES } from '../../src/data/constants';

const router = Router();
router.use(requireUser);

const MOOD_IDS = new Set(MOODS.map((m) => m.id));
const BUDGET_IDS = new Set(BUDGET_RANGES.map((b) => b.id));

interface ProfileRow {
  home_city: string | null;
  home_state: string | null;
  preferred_moods: string[] | null;
  default_budget_id: string | null;
}

function toResponse(name: string | undefined, row: ProfileRow | null) {
  return {
    name: name ?? null,
    homeCity: row?.home_city ?? null,
    homeState: row?.home_state ?? null,
    preferredMoods: row?.preferred_moods ?? [],
    defaultBudgetId: row?.default_budget_id ?? null,
  };
}

router.get('/', async (req, res) => {
  if (!supabase) {
    res.json(toResponse(req.user!.name, null));
    return;
  }
  const { data, error } = await supabase
    .from('user_profiles')
    .select('home_city, home_state, preferred_moods, default_budget_id')
    .eq('user_id', req.user!.id)
    .maybeSingle();
  if (error) {
    console.error('GET /api/profile failed:', error);
    res.status(500).json({ error: 'Failed to load profile' });
    return;
  }
  res.json(toResponse(req.user!.name, data));
});

router.put('/', async (req, res) => {
  if (!supabase) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }

  const body = req.body ?? {};
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : undefined;
  const homeCity = typeof body.homeCity === 'string' ? body.homeCity.trim().slice(0, 80) || null : undefined;
  const homeState = typeof body.homeState === 'string' ? body.homeState.trim().slice(0, 80) || null : undefined;
  const preferredMoods = Array.isArray(body.preferredMoods)
    ? body.preferredMoods.filter((m: unknown): m is string => typeof m === 'string' && MOOD_IDS.has(m))
    : undefined;
  const defaultBudgetId =
    body.defaultBudgetId === null
      ? null
      : typeof body.defaultBudgetId === 'string' && BUDGET_IDS.has(body.defaultBudgetId)
        ? body.defaultBudgetId
        : undefined;

  if (name) {
    const { error } = await supabase.auth.admin.updateUserById(req.user!.id, {
      user_metadata: { full_name: name },
    });
    if (error) {
      console.error('PUT /api/profile name update failed:', error);
      res.status(500).json({ error: 'Failed to update name' });
      return;
    }
  }

  const patch: Record<string, unknown> = { user_id: req.user!.id, updated_at: new Date().toISOString() };
  if (homeCity !== undefined) patch.home_city = homeCity;
  if (homeState !== undefined) patch.home_state = homeState;
  if (preferredMoods !== undefined) patch.preferred_moods = preferredMoods;
  if (defaultBudgetId !== undefined) patch.default_budget_id = defaultBudgetId;

  const { error: upsertError } = await supabase.from('user_profiles').upsert(patch, { onConflict: 'user_id' });
  if (upsertError) {
    console.error('PUT /api/profile upsert failed:', upsertError);
    res.status(500).json({ error: 'Failed to save profile' });
    return;
  }

  const { data, error: selectError } = await supabase
    .from('user_profiles')
    .select('home_city, home_state, preferred_moods, default_budget_id')
    .eq('user_id', req.user!.id)
    .maybeSingle();
  if (selectError) {
    res.status(500).json({ error: 'Failed to load profile' });
    return;
  }
  res.json(toResponse(name ?? req.user!.name, data));
});

export default router;
