import nodemailer from 'nodemailer';
import db from '../db/index.js';

const sseClients = new Set();

export function addSseClient(res) {
  sseClients.add(res);
  res.on('close', () => sseClients.delete(res));
}

function broadcastSse(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

const insertNotification = db.prepare(`
  INSERT INTO notifications (hotspot_id, type, message, read)
  VALUES (?, ?, ?, 0)
`);

export async function sendNotification(hotspot) {
  const message = `[${hotspot.source}] ${hotspot.title} — ${hotspot.summary}`;

  insertNotification.run(hotspot.id, 'browser', message);
  broadcastSse({ type: 'hotspot', ...hotspot, message });

  await sendEmail(hotspot, message);
}

async function sendEmail(hotspot, message) {
  const emailEnabled = db.prepare("SELECT value FROM settings WHERE key = 'email_enabled'").get();
  if (emailEnabled?.value !== 'true') return;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !NOTIFY_EMAIL) return;

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: SMTP_USER,
      to: NOTIFY_EMAIL,
      subject: `[🔥热点] ${hotspot.title.slice(0, 60)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#ff6b2b">${hotspot.title}</h2>
          <p>${hotspot.summary}</p>
          <p style="color:#666">来源: ${hotspot.source} | 评分: ${hotspot.score}</p>
          <a href="${hotspot.url}" style="color:#ff6b2b">查看原文 →</a>
        </div>
      `,
    });

    insertNotification.run(hotspot.id, 'email', message);
    console.log('[Notify] Email sent for:', hotspot.title.slice(0, 40));
  } catch (err) {
    console.error('[Notify] Email failed:', err.message);
  }
}
