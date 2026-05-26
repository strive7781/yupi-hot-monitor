import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

router.get('/', (req, res) => {
  const { scope, limit = 50, keyword } = req.query;
  let sql = 'SELECT * FROM hotspots WHERE is_genuine = 1';
  const params = [];

  if (scope) {
    sql += ' AND keyword IN (SELECT keyword FROM keywords WHERE scope = ?)';
    params.push(scope);
  }
  if (keyword) {
    sql += ' AND keyword = ?';
    params.push(keyword);
  }

  sql += ' ORDER BY score DESC, created_at DESC LIMIT ?';
  params.push(Number(limit));

  res.json(db.prepare(sql).all(...params));
});

router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM hotspots').get();
  const today = db
    .prepare("SELECT COUNT(*) as count FROM hotspots WHERE date(created_at) = date('now')")
    .get();
  const bySource = db
    .prepare('SELECT source, COUNT(*) as count FROM hotspots GROUP BY source')
    .all();

  res.json({ total: total.count, today: today.count, bySource });
});

export default router;
