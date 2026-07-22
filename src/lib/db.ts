/**
 * Bază de date server-side (SQLite pe VPS, prin /api/db-read și /api/db-write).
 * Citirea și scrierea trec întotdeauna prin API — nu mai există acces direct din browser.
 */

// Returns T | null when the server responded (null = cheie inexistentă)
// Returns undefined on network error
export async function dbRead<T>(path: string): Promise<T | null | undefined> {
  try {
    const res = await fetch(`/api/db-read?path=${encodeURIComponent(path)}`);
    if (!res.ok) return undefined;
    return (await res.json()) as T | null;
  } catch {
    return undefined;
  }
}

// 'ok' = scris pe server · 'unauthorized' = sesiune lipsă/expirată (401)
// 'error' = altă eroare de rețea/server
export type DbWriteResult = 'ok' | 'unauthorized' | 'error';

export async function dbWrite<T>(path: string, data: T): Promise<DbWriteResult> {
  try {
    const res = await fetch('/api/db-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, data }),
    });
    if (res.ok) return 'ok';
    if (res.status === 401) return 'unauthorized';
    return 'error';
  } catch {
    return 'error'; // network error — localStorage already saved locally
  }
}
