// Stocare locală key-value (SQLite, node:sqlite — nativ în Node 22, fără dependențe).
// Înlocuiește Firebase Realtime Database: fiecare "path" Firebase devine o cheie aici,
// valoarea e JSON serializat, la fel ca înainte.
//
// IMPORTANT: DatabaseSync e sincron — sigur de folosit dintr-un singur proces Node
// (rulează sub pm2 în fork mode, NU cluster mode; instanțe multiple ar deschide fiecare
// propria conexiune către același fișier și SQLite ar da SQLITE_BUSY sub scriere concurentă).
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'app.db');

const db = new DatabaseSync(DB_PATH);
db.exec('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)');

const stmtGet = db.prepare('SELECT value FROM kv WHERE key = ?');
const stmtPut = db.prepare(
  'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
);
const stmtDelete = db.prepare('DELETE FROM kv WHERE key = ?');

export function kvGet<T>(key: string): T | null {
  const row = stmtGet.get(key) as { value: string } | undefined;
  return row ? (JSON.parse(row.value) as T) : null;
}

export function kvPut(key: string, value: unknown): void {
  stmtPut.run(key, JSON.stringify(value));
}

export function kvDelete(key: string): void {
  stmtDelete.run(key);
}
