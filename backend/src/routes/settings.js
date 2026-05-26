import { Router } from 'express';
import db from '../db/index.js';
import { restartScheduler } from '../services/scheduler.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json(settings);
});

router.put('/', (req, res) => {
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(req.body)) {
    upsert.run(key, String(value));
  }
  if ('cron_interval' in req.body) restartScheduler();
  res.json({ ok: true });
});

export default router;
