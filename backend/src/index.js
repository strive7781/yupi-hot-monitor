import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import keywordsRouter from './routes/keywords.js';
import hotspotsRouter from './routes/hotspots.js';
import notificationsRouter from './routes/notifications.js';
import settingsRouter from './routes/settings.js';
import scanRouter from './routes/scan.js';
import { startScheduler } from './services/scheduler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    ai: !!process.env.OPENROUTER_API_KEY,
    twitter: !!process.env.TWITTER_API_KEY,
  });
});

app.use('/api/keywords', keywordsRouter);
app.use('/api/hotspots', hotspotsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/scan', scanRouter);

startScheduler();

app.listen(PORT, () => {
  console.log(`🍉 Yupi Hot Monitor backend running on http://localhost:${PORT}`);
});
