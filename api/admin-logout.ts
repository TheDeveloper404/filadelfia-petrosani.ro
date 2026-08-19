// Logout admin — invalidează cookie-ul de sesiune server-side (Max-Age=0).
// Sesiunea e un token HMAC fără stare (fără listă de revocare), deci acest endpoint nu
// poate invalida un token deja exfiltrat — dar închide scenariul real: cineva apasă
// "Blochează" pe un calculator comun crezând că a ieșit din cont, iar cookie-ul HttpOnly
// rămânea valid până la expirare (8h) fără el.

import { SESSION_COOKIE } from './_auth';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  return json({ ok: true }, 200, {
    'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
  });
}

function json(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
