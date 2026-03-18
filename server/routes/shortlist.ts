import { Router, type Request, type Response } from 'express';
import { supabase } from '../db';

const router = Router();

// GET /api/shortlist
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Fetch all saved trips with their destination details
    const { data: savedRows, error: savedErr } = await supabase
      .from('saved_trips')
      .select('destination_id, saved_at')
      .order('saved_at', { ascending: false });

    if (savedErr) throw new Error(savedErr.message);

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const trips = await Promise.all(
      (savedRows ?? []).map(async (s: any) => {
        const { data: dest, error: dErr } = await supabase
          .from('destinations')
          .select('*')
          .eq('id', s.destination_id)
          .single();

        if (dErr || !dest) return null;

        const { data: monthly, error: mErr } = await supabase
          .from('monthly_data')
          .select('month, estimated_cost')
          .eq('destination_id', s.destination_id);

        if (mErr) return null;

        const accessibleMonths = (monthly ?? []).filter((m: any) => m.estimated_cost > 0);
        let minCost = 0;
        let minCostMonthIdx = 0;

        if (accessibleMonths.length > 0) {
          const cheapest = accessibleMonths.reduce((min: any, m: any) =>
            m.estimated_cost < min.estimated_cost ? m : min, accessibleMonths[0]);
          minCost = cheapest.estimated_cost;
          minCostMonthIdx = cheapest.month - 1; // 0-indexed for MONTH_NAMES
        }

        return {
          destinationId: s.destination_id,
          savedAt: s.saved_at,
          minCost,
          cheapestMonth: MONTH_NAMES[minCostMonthIdx] ?? '',
          matchScore: 90 + (dest.id.length % 10),
          destination: {
            id: dest.id,
            name: dest.name,
            state: dest.state,
            heroImages: JSON.parse(dest.hero_images),
            sentiment: JSON.parse(dest.sentiment),
            description: dest.description,
            moods: JSON.parse(dest.moods),
            durationDays: dest.duration_days,
          },
        };
      })
    );

    res.json({ trips: trips.filter(Boolean) });
  } catch (err) {
    console.error('Shortlist GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/shortlist
router.post('/', async (req: Request, res: Response) => {
  try {
    const { destinationId } = req.body;
    if (!destinationId) {
      res.status(400).json({ error: 'destinationId is required' });
      return;
    }

    // Verify destination exists
    const { data: dest, error: dErr } = await supabase
      .from('destinations')
      .select('id')
      .eq('id', destinationId)
      .single();

    if (dErr || !dest) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    const { error } = await supabase
      .from('saved_trips')
      .upsert({ destination_id: destinationId }, { onConflict: 'destination_id' });

    if (error) throw new Error(error.message);

    res.json({ success: true });
  } catch (err) {
    console.error('Shortlist POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/shortlist/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('saved_trips')
      .delete()
      .eq('destination_id', id);

    if (error) throw new Error(error.message);

    res.json({ success: true });
  } catch (err) {
    console.error('Shortlist DELETE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
