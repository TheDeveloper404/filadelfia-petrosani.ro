/**
 * Firebase Realtime Database — REST API helpers.
 * Requires VITE_FIREBASE_DB_URL in .env (e.g. https://your-project-default-rtdb.firebaseio.com)
 * If the variable is not set the helpers are silent no-ops, falling back to localStorage.
 */

const BASE = import.meta.env.VITE_FIREBASE_DB_URL as string | undefined;

export async function dbRead<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/${path}.json`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function dbWrite<T>(path: string, data: T): Promise<void> {
  if (!BASE) return;
  try {
    await fetch(`${BASE}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // network error — localStorage already saved locally
  }
}
