import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import recommendationsRouter from './routes/recommendations';
import tripsRouter from './routes/trips';
import compareRouter from './routes/compare';
import itineraryRouter from './routes/itinerary';
import analyticsRouter from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/compare', compareRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/analytics', analyticsRouter);

// Health check — also reports which integrations are live vs. running on
// fallbacks, so the demo can be tested with zero keys configured.
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    integrations: {
      supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      affiliate: Boolean(process.env.TRAVELPAYOUTS_MARKER),
    },
  });
});

// Serve the built SPA in production (single Render web service).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`TailorTrip server running on http://localhost:${PORT}`);
});
