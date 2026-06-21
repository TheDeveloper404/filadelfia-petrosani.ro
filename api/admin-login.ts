// Vercel Edge Function — login admin cu rate-limiting.
// Validează PIN-ul server-side (env ADMIN_PIN) și emite un cookie de sesiune semnat.
// Brute-force protection pe două straturi (contoare în Firebase):
//   1. per-IP (IP de încredere din x-real-ip): 5 încercări greșite → blocare 15 min
//   2. global: prag mare cu cooldown scurt — cap pe rata totală chiar dacă IP-ul e ocolit

import { createSession, SESSION_COOKIE, SESSION_MAX_AGE, timingSafeEqual, clientIpKey } from './_auth';

export const config = { runtime: 'edge' };

const ADMIN_PIN = process.env.ADMIN_PIN ?? '';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? '';
const DB_URL = process.env.FIREBASE_DB_URL ?? '';
const DB_SECRET = process.env.FIREBASE_DB_SECRET ?? '';

// Per-IP
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 min
// Global (defense-in-depth) — prag mare + cooldown scurt ca să nu poată fi folosit ușor ca DoS
const GLOBAL_MAX = 30;
const GLOBAL_WINDOW_MS = 15 * 60 * 1000; // fereastră 15 min
const GLOBAL_LOCK_MS = 2 * 60 * 1000;    // cooldown 2 min

interface Attempt { fails: number; lockUntil: number }
interface Global { fails: number; windowStart: number; lockUntil: number }

const dbUrl = (path: string) => `${DB_URL}/admin_login_attempts/${path}.json?auth=${DB_SECRET}`;
const getJson = <T>(url: string) => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null) as Promise<T | null>;
const putJson = (url: string, v: unknown) =>
  fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) }).catch(() => {});

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  if (!ADMIN_PIN || !SESSION_SECRET || !DB_URL || !DB_SECRET) {
    console.error('[admin-login] env-uri lipsă (ADMIN_PIN / ADMIN_SESSION_SECRET / FIREBASE_*)');
    return json({ error: 'Autentificare neconfigurată pe server.' }, 503);
  }

  const now = Date.now();
  const ipUrl = dbUrl(clientIpKey(request));
  const globalUrl = dbUrl('_global');

  const [ipRec, gRec] = await Promise.all([getJson<Attempt>(ipUrl), getJson<Global>(globalUrl)]);

  // Blocat per-IP sau global?
  if (ipRec?.lockUntil && ipRec.lockUntil > now) {
    return tooMany(Math.ceil((ipRec.lockUntil - now) / 1000), 'Prea multe încercări. Reîncearcă peste câteva minute.');
  }
  if (gRec?.lockUntil && gRec.lockUntil > now) {
    return tooMany(Math.ceil((gRec.lockUntil - now) / 1000), 'Sistem temporar blocat din cauza încercărilor repetate. Reîncearcă în scurt timp.');
  }

  let pin: unknown;
  try { pin = ((await request.json()) as { pin?: unknown }).pin; }
  catch { return json({ error: 'Cerere invalidă.' }, 400); }

  const ok = typeof pin === 'string' && timingSafeEqual(pin, ADMIN_PIN);

  if (!ok) {
    // 1. contor per-IP
    const fails = (ipRec?.fails ?? 0) + 1;
    const nextIp: Attempt = fails >= MAX_FAILS ? { fails: 0, lockUntil: now + LOCK_MS } : { fails, lockUntil: 0 };

    // 2. contor global (sliding window)
    const inWindow = gRec && now - gRec.windowStart < GLOBAL_WINDOW_MS;
    const gFails = (inWindow ? gRec!.fails : 0) + 1;
    const nextGlobal: Global = gFails >= GLOBAL_MAX
      ? { fails: 0, windowStart: now, lockUntil: now + GLOBAL_LOCK_MS }
      : { fails: gFails, windowStart: inWindow ? gRec!.windowStart : now, lockUntil: 0 };

    await Promise.all([putJson(ipUrl, nextIp), putJson(globalUrl, nextGlobal)]);

    return json(
      nextIp.lockUntil > now
        ? { error: 'Prea multe încercări. Cont blocat 15 minute.' }
        : { error: 'Cod incorect.', attemptsLeft: MAX_FAILS - fails },
      401,
    );
  }

  // Succes — resetează contorul per-IP și emite sesiunea (globalul decade singur prin fereastră)
  await fetch(ipUrl, { method: 'DELETE' }).catch(() => {});
  const token = await createSession(SESSION_SECRET);
  return json({ ok: true }, 200, {
    'Set-Cookie': `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}`,
  });
}

function tooMany(retry: number, msg: string): Response {
  return json({ error: msg }, 429, { 'Retry-After': String(retry) });
}

function json(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
