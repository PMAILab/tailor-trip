import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { env } from '../config/env.js';

const router = Router();

router.post('/', async (req, res) => {
  const event: string | undefined = req.body?.event;
  const data = req.body?.data ?? {};
  if (!event) {
    res.status(400).json({ error: 'event is required' });
    return;
  }

  // Best-effort persistence; never blocks or fails the client.
  try {
    if (supabase) {
      await supabase.from('analytics_events').insert({ event_type: event, event_data: JSON.stringify(data) });
    } else if (!env.isProd) {
      console.log('[analytics]', event, data);
    }
  } catch (err) {
    console.error('analytics insert failed:', err);
  }

  res.json({ success: true });
});

export default router;
