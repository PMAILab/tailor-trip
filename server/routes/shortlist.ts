import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';

const router = Router();

// GET /api/shortlist
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT s.destination_id, s.saved_at, d.*
      FROM saved_trips s
      JOIN destinations d ON d.id = s.destination_id
      ORDER BY s.saved_at DESC
    `).all() as any[];

    // Fetch monthly data for each
    const trips = rows.map((r: any) => {
      const monthlyRows = db.prepare('SELECT month, estimated_cost FROM monthly_data WHERE destination_id = ?').all(r.id) as any[];
      
      let minCost = 0;
      let minCostMonth = 0;
      if (monthlyRows.length > 0) {
        const accessibleMonths = monthlyRows.filter(m => m.estimated_cost > 0);
        if (accessibleMonths.length > 0) {
          minCost = Math.min(...accessibleMonths.map(m => m.estimated_cost));
          minCostMonth = accessibleMonths.find(m => m.estimated_cost === minCost)?.month || 0;
        }
      }
      
      const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return {
        destinationId: r.destination_id,
        savedAt: r.saved_at,
        minCost: minCost,
        cheapestMonth: MONTH_NAMES[minCostMonth],
        // Mock match score for now, this would usually come from profile matching
        matchScore: 90 + (r.id.length % 10), 
        destination: {
          id: r.id,
          name: r.name,
          state: r.state,
          heroImages: JSON.parse(r.hero_images),
          sentiment: JSON.parse(r.sentiment),
          description: r.description,
          moods: JSON.parse(r.moods),
          durationDays: r.duration_days,
        },
      };
    });

    res.json({ trips });
  } catch (err) {
    console.error('Shortlist GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/shortlist
router.post('/', (req: Request, res: Response) => {
  try {
    const { destinationId } = req.body;
    if (!destinationId) {
      res.status(400).json({ error: 'destinationId is required' });
      return;
    }

    const db = getDb();
    const dest = db.prepare('SELECT id FROM destinations WHERE id = ?').get(destinationId);
    if (!dest) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    db.prepare(
      'INSERT OR IGNORE INTO saved_trips (destination_id) VALUES (?)'
    ).run(destinationId);

    res.json({ success: true });
  } catch (err) {
    console.error('Shortlist POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/shortlist/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.prepare('DELETE FROM saved_trips WHERE destination_id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Shortlist DELETE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
