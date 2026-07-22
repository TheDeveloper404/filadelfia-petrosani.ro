// Citire publică din baza de date locală (SQLite pe VPS) — înlocuiește citirea directă
// din Firebase Realtime Database făcută anterior din browser (client.ts -> Firebase REST).
import { kvGet } from './_db';

// Doar aceste căi sunt publice la citire (aceleași ca la scriere din admin)
const ALLOWED_PATHS = new Set(['events', 'schedule', 'maintenanceBanner', 'announcementBanner']);

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return respond({ error: 'Method Not Allowed' }, 405);

  const path = new URL(request.url).searchParams.get('path') ?? '';
  if (!ALLOWED_PATHS.has(path)) return respond({ error: 'Invalid path' }, 400);

  try {
    const data = kvGet(path);
    return respond(data, 200);
  } catch (err) {
    console.error('[db-read] unexpected error', err);
    return respond({ error: 'Internal error' }, 500);
  }
}

function respond(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
