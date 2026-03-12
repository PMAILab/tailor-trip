import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db';
import recommendationsRouter from './routes/recommendations';
import tripsRouter from './routes/trips';
import shortlistRouter from './routes/shortlist';
import profileRouter from './routes/profile';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database (creates tables + seeds on first run)
getDb();

// Mount routes
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/shortlist', shortlistRouter);
app.use('/api/profile', profileRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
