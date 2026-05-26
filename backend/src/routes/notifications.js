import { Router } from 'express';
import db from '../db/index.js';
import { addSseClient } from '../services/notification.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT n.*, h.title as hotspot_title, h.url as hotspot_url FROM notifications n LEFT JOIN hotspots h ON n.hotspot_id = h.id ORDER BY n.created_at DESC LIMIT 100')
    .all();
  res.json(rows);
});

router.get('/unread-count', (req, res) => {
  const row = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE read = 0').get();
  res.json({ count: row.count });
});

router.patch('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.patch('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE read = 0').run();
  res.json({ ok: true });
});

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write('data: {"type":"connected"}\n\n');
  addSseClient(res);
});

export default router;
