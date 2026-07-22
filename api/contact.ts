// Trimitere formular contact, server-side.
// Mută trimiterea pe server (cheia privată) ca rate-limit-ul să fie REAL (nu ocolibil din client)
// și ca să nu mai expună chei în bundle. Email: Maileroo API. Rate-limit: 3 mesaje / oră / IP
// (contor în SQLite local, vezi api/_db.ts).

import { clientIpKey } from './_auth';
import { kvGet, kvPut } from './_db';

const MAILEROO_API_KEY = process.env.MAILEROO_API_KEY ?? '';
const MAILEROO_FROM_ADDRESS = process.env.MAILEROO_FROM_ADDRESS ?? '';
const MAILEROO_FROM_NAME = process.env.MAILEROO_FROM_NAME ?? 'Biserica Filadelfia Petroșani';
const MAILEROO_TO_ADDRESS = process.env.MAILEROO_TO_ADDRESS ?? '';

const MAX_PER_HOUR = 3;
const WINDOW_MS = 60 * 60 * 1000;

interface Rate { count: number; windowStart: number }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
// name ajunge în header-e (subject, reply_to display_name) — elimină CR/LF și alte
// caractere de control, altfel ar permite header injection.
const CONTROL_CHARS = new RegExp('[\\x00-\\x1F\\x7F]', 'g');
const stripControlChars = (s: string): string => s.replace(CONTROL_CHARS, ' ').trim();
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  if (!MAILEROO_API_KEY || !MAILEROO_FROM_ADDRESS || !MAILEROO_TO_ADDRESS) {
    console.error('[contact] env-uri lipsă (MAILEROO_*)');
    return json({ error: 'Trimiterea mesajelor nu este configurată.' }, 503);
  }

  // ── Validare input (înainte de rate-limit, ca să evităm un TOCTOU pe contor) ──
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Cerere invalidă.' }, 400); }

  const name = stripControlChars(clip(body.name, 100));
  const email = clip(body.email, 200);
  const message = clip(body.message, 5000);
  if (!name || !email || !message) return json({ error: 'Completează toate câmpurile.' }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: 'Adresă de email invalidă.' }, 400);

  // ── Rate-limit per IP (sliding window 1h) ──
  const now = Date.now();
  const rateKey = `contact_attempts/${clientIpKey(request)}`;
  const rec = kvGet<Rate>(rateKey);
  const inWindow = rec && now - rec.windowStart < WINDOW_MS;
  if (inWindow && rec!.count >= MAX_PER_HOUR) {
    const retry = Math.ceil((rec!.windowStart + WINDOW_MS - now) / 1000);
    return json({ error: 'Ai trimis prea multe mesaje într-o oră. Te rugăm să încerci mai târziu.' }, 429, { 'Retry-After': String(retry) });
  }

  // ── Trimite prin Maileroo REST API (server-side) ──
  const sent = await fetch('https://smtp.maileroo.com/api/v2/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': MAILEROO_API_KEY },
    body: JSON.stringify({
      from: { address: MAILEROO_FROM_ADDRESS, display_name: MAILEROO_FROM_NAME },
      to: { address: MAILEROO_TO_ADDRESS },
      reply_to: { address: email, display_name: name },
      subject: `Mesaj de contact — ${name}`,
      html: `<p><strong>Nume:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
      plain: `Nume: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  }).catch(() => null);

  if (!sent || !sent.ok) {
    console.error('[contact] Maileroo error', sent?.status);
    return json({ error: 'Mesajul nu a putut fi trimis. Încearcă din nou.' }, 502);
  }

  // Înregistrează trimiterea reușită în contor
  const next: Rate = inWindow ? { count: rec!.count + 1, windowStart: rec!.windowStart } : { count: 1, windowStart: now };
  kvPut(rateKey, next);

  return json({ ok: true }, 200);
}

function json(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
