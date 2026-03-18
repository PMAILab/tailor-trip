import { Router, type Request, type Response } from 'express';
import { supabase } from '../db';

const router = Router();

// POST /api/analytics
router.post('/', async (req: Request, res: Response) => {
  try {
    const { eventType, eventData } = req.body;

    if (!eventType) {
      res.status(400).json({ error: 'eventType is required' });
      return;
    }

    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: eventData ? JSON.stringify(eventData) : null,
    });

    if (error) throw new Error(error.message);

    res.json({ success: true });
  } catch (err) {
    console.error('Analytics POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
