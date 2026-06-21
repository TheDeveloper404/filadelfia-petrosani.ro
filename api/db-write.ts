// Vercel Edge Function — Firebase write proxy
// Direct writes to Firebase are blocked (rules: ".write": false)
// This function writes using server-side credentials (FIREBASE_DB_SECRET)
// Acces permis DOAR cu o sesiune de admin validă (cookie semnat) — vezi api/admin-login.ts

import { SESSION_COOKIE, verifySession, getCookie } from './_auth';

export const config = { runtime: 'edge' };

const DB_URL = process.env.FIREBASE_DB_URL ?? '';
const DB_SECRET = process.env.FIREBASE_DB_SECRET ?? '';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? '';

// Doar aceste căi pot fi scrise din admin (defense-in-depth)
const ALLOWED_PATHS = new Set(['events', 'schedule', 'maintenanceBanner', 'announcementBanner']);

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return respond({ error: 'Method Not Allowed' }, 405);
  }

  if (!DB_URL || !DB_SECRET || !SESSION_SECRET) {
    console.error('[db-write] env-uri lipsă (FIREBASE_* / ADMIN_SESSION_SECRET)');
    return respond({ error: 'Not configured' }, 503);
  }

  // Autorizare: necesită sesiune de admin validă
  const token = getCookie(request, SESSION_COOKIE);
  if (!(await verifySession(token, SESSION_SECRET))) {
    return respond({ error: 'Unauthorized' }, 401);
  }

  let path: string;
  let data: unknown;
  try {
    const body = await request.json() as { path: string; data: unknown };
    path = body.path;
    data = body.data;
  } catch {
    return respond({ error: 'Invalid JSON' }, 400);
  }

  if (!path || typeof path !== 'string' || !ALLOWED_PATHS.has(path)) {
    return respond({ error: 'Invalid path' }, 400);
  }

  try {
    const res = await fetch(`${DB_URL}/${path}.json?auth=${DB_SECRET}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error('[db-write] Firebase error', res.status);
      return respond({ error: 'Firebase write failed' }, res.status);
    }

    return respond({ ok: true }, 200);
  } catch (err) {
    console.error('[db-write] unexpected error', err);
    return respond({ error: 'Internal error' }, 500);
  }
}

function respond(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
