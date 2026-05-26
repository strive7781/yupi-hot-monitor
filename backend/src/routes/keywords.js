import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM keywords ORDER BY created_at DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { keyword, scope } = req.body;
  if (!keyword?.trim()) return res.status(400).json({ error: 'keyword is required' });

  try {
    const result = db
      .prepare('INSERT INTO keywords (keyword, scope) VALUES (?, ?)')
      .run(keyword.trim(), scope || 'AI 编程');
    res.status(201).json({ id: result.lastInsertRowid, keyword: keyword.trim(), scope: scope || 'AI 编程' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: '关键词已存在' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM keywords WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

router.patch('/:id/toggle', (req, res) => {
  const row = db.prepare('SELECT enabled FROM keywords WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  const newVal = row.enabled ? 0 : 1;
  db.prepare('UPDATE keywords SET enabled = ? WHERE id = ?').run(newVal, req.params.id);
  res.json({ enabled: newVal });
});

export default router;
