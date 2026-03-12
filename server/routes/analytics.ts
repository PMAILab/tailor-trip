import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';

const router = Router();

// POST /api/analytics
router.post('/', (req: Request, res: Response) => {
  try {
    const { eventType, eventData } = req.body;
    
    if (!eventType) {
      res.status(400).json({ error: 'eventType is required' });
      return;
    }

    const db = getDb();
    db.prepare('INSERT INTO analytics_events (event_type, event_data) VALUES (?, ?)')
      .run(eventType, eventData ? JSON.stringify(eventData) : null);

    res.json({ success: true });
  } catch (err) {
    console.error('Analytics POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
