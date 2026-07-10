import { Router } from 'express';
import { reverseGeocode } from '../services/geocode';

const router = Router();

router.get('/reverse', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'lat and lng query params are required' });
    return;
  }
  const label = await reverseGeocode(lat, lng);
  res.json({ label });
});

export default router;
