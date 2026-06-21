// Helpere pentru sesiunea de admin — cookie semnat HMAC, compatibil edge-runtime.
// Prefixul `_` face ca fișierul să NU fie tratat ca rută de către Vercel.

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64url(new Uint8Array(sig));
}

// Comparație în timp constant — evită scurgerile de timing.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const SESSION_COOKIE = 'admin_session';
const TTL_MS = 8 * 60 * 60 * 1000; // 8h
export const SESSION_MAX_AGE = TTL_MS / 1000;

export async function createSession(secret: string): Promise<string> {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${await hmac(secret, String(exp))}`;
}

export async function verifySession(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return timingSafeEqual(sig, await hmac(secret, exp));
}

export function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

// Cheie Firebase-safe derivată din IP-ul clientului (pentru rate-limiting).
// IMPORTANT: `x-forwarded-for` e setabil de client (spoofing → bypass rate-limit).
// Pe Vercel, `x-real-ip` e setat de infrastructură (de încredere); ca fallback luăm
// entry-ul cel mai din DREAPTA din XFF (cel adăugat de Vercel), nu primul.
export function clientIpKey(request: Request): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  const xffParts = (request.headers.get('x-forwarded-for') ?? '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const ip = realIp || xffParts[xffParts.length - 1] || 'unknown';
  return base64url(encoder.encode(ip));
}
