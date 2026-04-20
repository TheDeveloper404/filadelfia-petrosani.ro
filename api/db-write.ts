// Vercel Serverless Function — Firebase write proxy
// Direct writes to Firebase are blocked (rules: ".write": false)
// This function writes using server-side credentials (FIREBASE_DB_SECRET)

const DB_URL = process.env.FIREBASE_DB_URL ?? '';
const DB_SECRET = process.env.FIREBASE_DB_SECRET ?? '';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return respond({ error: 'Method Not Allowed' }, 405);
  }

  if (!DB_URL || !DB_SECRET) {
    console.error('[db-write] FIREBASE_DB_URL or FIREBASE_DB_SECRET not set');
    return respond({ error: 'Not configured' }, 503);
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

  if (!path || typeof path !== 'string') {
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
