import cron from 'node-cron';
import db from '../db/index.js';
import { runFullScan } from './collector.js';

let cronJob = null;

export function startScheduler() {
  const interval = db.prepare("SELECT value FROM settings WHERE key = 'cron_interval'").get();
  const minutes = Number(interval?.value) || Number(process.env.CRON_INTERVAL_MINUTES) || 30;

  if (cronJob) cronJob.stop();

  // Run every N minutes
  const cronExpr = `*/${minutes} * * * *`;
  cronJob = cron.schedule(cronExpr, async () => {
    console.log(`[Scheduler] Running scheduled scan (every ${minutes} min)`);
    try {
      await runFullScan();
    } catch (err) {
      console.error('[Scheduler] Scan error:', err.message);
    }
  });

  console.log(`[Scheduler] Started — scan every ${minutes} minutes`);
}

export function restartScheduler() {
  if (cronJob) cronJob.stop();
  startScheduler();
}
