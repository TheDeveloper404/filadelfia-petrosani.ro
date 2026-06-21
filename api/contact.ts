// Vercel Edge Function — trimitere formular contact, server-side.
// Mută EmailJS pe server (cheia privată) ca rate-limit-ul să fie REAL (nu ocolibil din client)
// și ca să nu mai expună cheile EmailJS în bundle.
// Rate-limit: 3 mesaje / oră / IP (contor în Firebase).

import { clientIpKey } from './_auth';

export const config = { runtime: 'edge' };

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID ?? '';
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID ?? '';
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY ?? '';
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY ?? '';
const DB_URL = process.env.FIREBASE_DB_URL ?? '';
const DB_SECRET = process.env.FIREBASE_DB_SECRET ?? '';

const MAX_PER_HOUR = 3;
const WINDOW_MS = 60 * 60 * 1000;

interface Rate { count: number; windowStart: number }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY || !DB_URL || !DB_SECRET) {
    console.error('[contact] env-uri lipsă (EMAILJS_* / FIREBASE_*)');
    return json({ error: 'Trimiterea mesajelor nu este configurată.' }, 503);
  }

  // ── Rate-limit per IP (sliding window 1h) ──
  const now = Date.now();
  const rateUrl = `${DB_URL}/contact_attempts/${clientIpKey(request)}.json?auth=${DB_SECRET}`;
  const rec = await fetch(rateUrl).then(r => (r.ok ? r.json() : null)).catch(() => null) as Rate | null;
  const inWindow = rec && now - rec.windowStart < WINDOW_MS;
  if (inWindow && rec!.count >= MAX_PER_HOUR) {
    const retry = Math.ceil((rec!.windowStart + WINDOW_MS - now) / 1000);
    return json({ error: 'Ai trimis prea multe mesaje într-o oră. Te rugăm să încerci mai târziu.' }, 429, { 'Retry-After': String(retry) });
  }

  // ── Validare input ──
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Cerere invalidă.' }, 400); }

  const name = clip(body.name, 100);
  const email = clip(body.email, 200);
  const message = clip(body.message, 5000);
  if (!name || !email || !message) return json({ error: 'Completează toate câmpurile.' }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: 'Adresă de email invalidă.' }, 400);

  // ── Trimite prin EmailJS REST API (server-side) ──
  const sent = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      accessToken: PRIVATE_KEY,
      template_params: { name, email, message },
    }),
  }).catch(() => null);

  if (!sent || !sent.ok) {
    console.error('[contact] EmailJS error', sent?.status);
    return json({ error: 'Mesajul nu a putut fi trimis. Încearcă din nou.' }, 502);
  }

  // Înregistrează trimiterea reușită în contor
  const next: Rate = inWindow ? { count: rec!.count + 1, windowStart: rec!.windowStart } : { count: 1, windowStart: now };
  await fetch(rateUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(() => {});

  return json({ ok: true }, 200);
}

function json(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
