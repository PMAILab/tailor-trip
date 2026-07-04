import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireUser } from '../middleware/requireUser';

const router = Router();
router.use(requireUser);

// Every query below filters by user_id explicitly — that filter, not the
// table's RLS policies, is the real security boundary here, since this
// route uses the service-role client (which bypasses RLS entirely).

router.get('/', async (req, res) => {
  if (!supabase) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }
  const { data, error } = await supabase
    .from('shortlist_items')
    .select('destination_id')
    .eq('user_id', req.user!.id);
  if (error) {
    console.error('GET /api/shortlist failed:', error);
    res.status(500).json({ error: 'Failed to load shortlist' });
    return;
  }
  res.json({ ids: data.map((row) => row.destination_id as string) });
});

router.put('/:destinationId', async (req, res) => {
  if (!supabase) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }
  const { error } = await supabase
    .from('shortlist_items')
    .upsert({ user_id: req.user!.id, destination_id: req.params.destinationId }, { onConflict: 'user_id,destination_id' });
  if (error) {
    console.error('PUT /api/shortlist/:destinationId failed:', error);
    res.status(500).json({ error: 'Failed to save' });
    return;
  }
  const { data, error: selectError } = await supabase
    .from('shortlist_items')
    .select('destination_id')
    .eq('user_id', req.user!.id);
  if (selectError) {
    res.status(500).json({ error: 'Failed to load shortlist' });
    return;
  }
  res.json({ ids: data.map((row) => row.destination_id as string) });
});

router.delete('/:destinationId', async (req, res) => {
  if (!supabase) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }
  const { error } = await supabase
    .from('shortlist_items')
    .delete()
    .eq('user_id', req.user!.id)
    .eq('destination_id', req.params.destinationId);
  if (error) {
    console.error('DELETE /api/shortlist/:destinationId failed:', error);
    res.status(500).json({ error: 'Failed to remove' });
    return;
  }
  const { data, error: selectError } = await supabase
    .from('shortlist_items')
    .select('destination_id')
    .eq('user_id', req.user!.id);
  if (selectError) {
    res.status(500).json({ error: 'Failed to load shortlist' });
    return;
  }
  res.json({ ids: data.map((row) => row.destination_id as string) });
});

export default router;
