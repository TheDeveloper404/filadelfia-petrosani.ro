import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

const DB_URL = process.env.FIREBASE_DB_URL ?? '';
const DB_SECRET = process.env.FIREBASE_DB_SECRET ?? '';
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:biserica.filadelfia96@gmail.com';

interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  savedAt: number;
}

interface LastLive {
  videoId: string;
  notifiedAt: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { videoId, title } = (req.body ?? {}) as { videoId?: string; title?: string };
  if (!videoId) return res.status(400).json({ error: 'videoId required' });
  if (!DB_URL || !DB_SECRET || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(503).json({ error: 'Not configured' });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  // Deduplication — only notify once per videoId, with 2h cooldown
  const lastRes = await fetch(`${DB_URL}/push_last_live.json?auth=${DB_SECRET}`).catch(() => null);
  const last = lastRes ? await lastRes.json().catch(() => null) as LastLive | null : null;
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  if (last && last.videoId === videoId && last.notifiedAt > twoHoursAgo) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  // Mark as notified first to prevent race conditions
  await fetch(`${DB_URL}/push_last_live.json?auth=${DB_SECRET}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, notifiedAt: Date.now() }),
  }).catch(() => {});

  // Read all subscriptions
  const subsRes = await fetch(`${DB_URL}/push_subscriptions.json?auth=${DB_SECRET}`).catch(() => null);
  const subs = subsRes ? await subsRes.json().catch(() => null) as Record<string, StoredSubscription> | null : null;
  if (!subs) return res.status(200).json({ sent: 0 });

  const payload = JSON.stringify({
    title: 'Filadelfia — Transmisie Live',
    body: title ? `„${title}" — Apasă pentru a urmări` : 'Transmisia în direct a început!',
  });

  const entries = Object.entries(subs);
  let sent = 0;
  const toDelete: string[] = [];

  await Promise.allSettled(
    entries.map(async ([key, sub]) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) toDelete.push(key);
      }
    })
  );

  await Promise.allSettled(
    toDelete.map(key =>
      fetch(`${DB_URL}/push_subscriptions/${key}.json?auth=${DB_SECRET}`, { method: 'DELETE' })
    )
  );

  return res.status(200).json({ sent, deleted: toDelete.length });
}
