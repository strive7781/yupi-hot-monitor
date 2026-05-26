import { Router } from 'express';
import { runFullScan } from '../services/collector.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await runFullScan();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
