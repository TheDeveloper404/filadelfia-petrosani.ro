// Scriere în baza de date locală (SQLite pe VPS).
// Acces permis DOAR cu o sesiune de admin validă (cookie semnat) — vezi api/admin-login.ts

import { SESSION_COOKIE, verifySession, getCookie } from './_auth';
import { kvPut } from './_db';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? '';

// Doar aceste căi pot fi scrise din admin (defense-in-depth)
const ALLOWED_PATHS = new Set(['events', 'schedule', 'maintenanceBanner', 'announcementBanner']);

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return respond({ error: 'Method Not Allowed' }, 405);
  }

  if (!SESSION_SECRET) {
    console.error('[db-write] env lipsă (ADMIN_SESSION_SECRET)');
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
    kvPut(path, data);
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
