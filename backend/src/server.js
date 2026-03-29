import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { getArticles, countArticles, getLatestFetchDate } from './db.js';
import { refreshNews } from './newsService.js';
import { CATEGORY_META } from './rssFeeds.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────

// GET /api/news?category=all&limit=30&offset=0
app.get('/api/news', (req, res) => {
  const { category = 'all', limit = 30, offset = 0 } = req.query;
  try {
    const articles = getArticles({
      category: category === 'all' ? null : category,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({ articles, total: articles.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories
app.get('/api/categories', (_req, res) => {
  res.json(CATEGORY_META);
});

// GET /api/status
app.get('/api/status', (_req, res) => {
  res.json({
    total_articles: countArticles(),
    latest_fetch: getLatestFetchDate(),
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// POST /api/refresh  (manual trigger, protect with token in production)
app.post('/api/refresh', async (req, res) => {
  const token = req.headers['x-refresh-token'];
  if (process.env.REFRESH_SECRET && token !== process.env.REFRESH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    // Don't await - run in background and return immediately
    res.json({ message: 'Refresh started' });
    await refreshNews();
  } catch (err) {
    console.error('[Refresh] Error:', err.message);
  }
});

// ─── Cron: Every day at 6:00 and 18:00 ─────────────────────────────────────
cron.schedule('0 6,18 * * *', async () => {
  console.log('[Cron] Scheduled news refresh triggered');
  await refreshNews();
});

// ─── Startup ────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`[Slide Backend] Running on http://localhost:${PORT}`);

  // Auto-fetch on startup if DB is empty
  if (countArticles() === 0) {
    console.log('[Startup] DB is empty - fetching initial news...');
    refreshNews().catch(console.error);
  } else {
    console.log(`[Startup] DB has ${countArticles()} articles. Latest: ${getLatestFetchDate()}`);
  }
});
