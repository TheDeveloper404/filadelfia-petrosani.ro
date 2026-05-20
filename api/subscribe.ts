import type { VercelRequest, VercelResponse } from '@vercel/node';

const DB_URL = process.env.FIREBASE_DB_URL ?? '';
const DB_SECRET = process.env.FIREBASE_DB_SECRET ?? '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'DELETE') {
    const { endpoint } = req.body ?? {};
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
    const key = Buffer.from(endpoint).toString('base64url').slice(0, 64);
    await fetch(`${DB_URL}/push_subscriptions/${key}.json?auth=${DB_SECRET}`, { method: 'DELETE' }).catch(() => {});
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const sub = req.body;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  if (!DB_URL || !DB_SECRET) return res.status(503).json({ error: 'Not configured' });

  const key = Buffer.from(sub.endpoint as string).toString('base64url').slice(0, 64);
  try {
    await fetch(`${DB_URL}/push_subscriptions/${key}.json?auth=${DB_SECRET}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.keys, savedAt: Date.now() }),
    });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
}
