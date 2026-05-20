import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendLiveNotification } from './_notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { videoId, title } = (req.body ?? {}) as { videoId?: string; title?: string };
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  const result = await sendLiveNotification(videoId, title ?? null);
  return res.status(200).json(result);
}
