/**
 * Firebase Realtime Database — REST API helpers.
 * Requires VITE_FIREBASE_DB_URL in .env (e.g. https://your-project-default-rtdb.firebaseio.com)
 * If the variable is not set the helpers are silent no-ops, falling back to localStorage.
 */

const BASE = import.meta.env.VITE_FIREBASE_DB_URL as string | undefined;

// Returns T | null when Firebase responded (null = node deleted/empty)
// Returns undefined on network error or when Firebase is not configured
export async function dbRead<T>(path: string): Promise<T | null | undefined> {
  if (!BASE) return undefined;
  try {
    const res = await fetch(`${BASE}/${path}.json`);
    if (!res.ok) return undefined;
    return (await res.json()) as T | null;
  } catch {
    return undefined;
  }
}

export async function dbWrite<T>(path: string, data: T): Promise<void> {
  if (!BASE) return;
  try {
    await fetch('/api/db-write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, data }),
    });
  } catch {
    // network error — localStorage already saved locally
  }
}
