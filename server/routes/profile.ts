import { Router, type Request, type Response } from 'express';
import { supabase } from '../db';

const router = Router();

// GET /api/profile
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data: row, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !row) {
      res.json({ name: '', preferredBudgetRange: null, moods: [] });
      return;
    }

    res.json({
      name: row.name || '',
      preferredBudgetRange: row.preferred_budget_range
        ? JSON.parse(row.preferred_budget_range)
        : null,
      moods: row.moods ? JSON.parse(row.moods) : [],
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, preferredBudgetRange, moods } = req.body;

    const { error } = await supabase.from('user_preferences').upsert(
      {
        id: 'default',
        name: name || '',
        preferred_budget_range: preferredBudgetRange
          ? JSON.stringify(preferredBudgetRange)
          : null,
        moods: moods ? JSON.stringify(moods) : null,
      },
      { onConflict: 'id' }
    );

    if (error) throw new Error(error.message);

    res.json({ success: true });
  } catch (err) {
    console.error('Profile POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
