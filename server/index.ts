import './env'; // must stay the first import — loads .env before anything else runs
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import recommendationsRouter from './routes/recommendations';
import tripsRouter from './routes/trips';
import compareRouter from './routes/compare';
import itineraryRouter from './routes/itinerary';
import analyticsRouter from './routes/analytics';
import authRouter from './routes/auth';
import shortlistRouter from './routes/shortlist';
import itinerariesRouter from './routes/itineraries';
import chatRouter from './routes/chat';
import profileRouter from './routes/profile';
import geocodeRouter from './routes/geocode';
import { isSupabaseAuthConfigured } from './lib/supabaseAuth';

const app = express();
const PORT = process.env.PORT || 3002;

// Required so req.protocol/req.get('host') report the real public scheme
// (https) behind Render's TLS-terminating reverse proxy — the OAuth
// redirectTo URL built from these must match what's allow-listed in
// Supabase, or Google sign-in breaks in production.
app.set('trust proxy', 1);

// Reflects the request origin (or pins to FRONTEND_ORIGIN when set) with
// credentials allowed — required for the Netlify-hosted frontend's fetch
// calls to send/receive the httpOnly session cookie across origins. A
// wildcard origin (the old default) can't be combined with credentials.
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// API routes
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/compare', compareRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
app.use('/api/shortlist', shortlistRouter);
app.use('/api/itineraries', itinerariesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/profile', profileRouter);
app.use('/api/geocode', geocodeRouter);

// Health check — also reports which integrations are live vs. running on
// fallbacks, so the demo can be tested with zero keys configured.
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    integrations: {
      supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      authConfigured: isSupabaseAuthConfigured,
      gemini: Boolean(process.env.GEMINI_API_KEY),
      unsplash: Boolean(process.env.UNSPLASH_ACCESS_KEY),
      affiliate: Boolean(process.env.TRAVELPAYOUTS_MARKER),
    },
  });
});

// Serve the built SPA only if it was actually built alongside this server —
// true for a single combined Render service, false for a split deploy where
// Netlify serves the frontend and this process is API-only. Checking for the
// file rather than branching on NODE_ENV lets the same server binary work
// unmodified in either topology.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`TailorTrip server running on http://localhost:${PORT}`);
});
