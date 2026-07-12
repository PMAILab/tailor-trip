import { Router } from 'express';
import { requireDb, type Db } from '../lib/supabaseClient.js';
import { requireUser } from '../middleware/requireUser.js';

const router = Router();
router.use(requireUser);

// Every query below filters by user_id explicitly — that filter, not the
// table's RLS policies, is the real security boundary here, since this
// route uses the service-role client (which bypasses RLS entirely).

async function currentIds(db: Db, userId: string): Promise<string[]> {
  const { data, error } = await db.from('shortlist_items').select('destination_id').eq('user_id', userId);
  if (error) throw error;
  return data.map((row) => row.destination_id as string);
}

router.get('/', async (req, res) => {
  const db = requireDb(res);
  if (!db) return;
  try {
    res.json({ ids: await currentIds(db, req.user!.id) });
  } catch (err) {
    console.error('GET /api/shortlist failed:', err);
    res.status(500).json({ error: 'Failed to load shortlist' });
  }
});

router.put('/:destinationId', async (req, res) => {
  const db = requireDb(res);
  if (!db) return;
  const { error } = await db
    .from('shortlist_items')
    .upsert({ user_id: req.user!.id, destination_id: req.params.destinationId }, { onConflict: 'user_id,destination_id' });
  if (error) {
    console.error('PUT /api/shortlist/:destinationId failed:', error);
    res.status(500).json({ error: 'Failed to save' });
    return;
  }
  try {
    res.json({ ids: await currentIds(db, req.user!.id) });
  } catch {
    res.status(500).json({ error: 'Failed to load shortlist' });
  }
});

router.delete('/:destinationId', async (req, res) => {
  const db = requireDb(res);
  if (!db) return;
  const { error } = await db
    .from('shortlist_items')
    .delete()
    .eq('user_id', req.user!.id)
    .eq('destination_id', req.params.destinationId);
  if (error) {
    console.error('DELETE /api/shortlist/:destinationId failed:', error);
    res.status(500).json({ error: 'Failed to remove' });
    return;
  }
  try {
    res.json({ ids: await currentIds(db, req.user!.id) });
  } catch {
    res.status(500).json({ error: 'Failed to load shortlist' });
  }
});

export default router;
