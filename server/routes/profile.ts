import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';

const router = Router();

// GET /api/profile
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM user_preferences WHERE id = ?').get('default') as any;

    if (!row) {
      res.json({ name: '', preferredBudgetRange: null, moods: [] });
      return;
    }

    res.json({
      name: row.name || '',
      preferredBudgetRange: row.preferred_budget_range ? JSON.parse(row.preferred_budget_range) : null,
      moods: row.moods ? JSON.parse(row.moods) : [],
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, preferredBudgetRange, moods } = req.body;
    const db = getDb();

    db.prepare(`
      INSERT INTO user_preferences (id, name, preferred_budget_range, moods)
      VALUES ('default', ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        preferred_budget_range = excluded.preferred_budget_range,
        moods = excluded.moods
    `).run(
      name || '',
      preferredBudgetRange ? JSON.stringify(preferredBudgetRange) : null,
      moods ? JSON.stringify(moods) : null
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Profile POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
