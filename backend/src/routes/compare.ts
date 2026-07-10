import { Router } from 'express';
import { streamCompareVerdict, type CompareDest } from '../services/gemini.js';

const router = Router();

/** Streams an AI recommendation over the compared trips as NDJSON:
 *  one `{ "delta": "..." }` per chunk, then `{ "done": true }`. */
router.post('/verdict', async (req, res) => {
  const destinations: CompareDest[] = Array.isArray(req.body?.destinations)
    ? req.body.destinations
    : [];
  const mood: string | null = req.body?.mood ?? null;

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    await streamCompareVerdict({ destinations, mood }, (delta) => {
      res.write(`${JSON.stringify({ delta })}\n`);
    });
  } catch (err) {
    console.error('POST /api/compare/verdict failed:', err);
  }
  res.write(`${JSON.stringify({ done: true })}\n`);
  res.end();
});

export default router;
