import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedIfEmpty } from './db';
import recommendationsRouter from './routes/recommendations';
import tripsRouter from './routes/trips';
import shortlistRouter from './routes/shortlist';
import profileRouter from './routes/profile';
import analyticsRouter from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Seed Supabase tables on first run
seedIfEmpty().catch(console.error);

// Mount routes
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/shortlist', shortlistRouter);
app.use('/api/profile', profileRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React frontend in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  // Catch-all: let React Router handle client-side routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
