import { describe, it, expect } from 'vitest';
import handler from '../api/admin-logout';

describe('admin-logout', () => {
  it('rejects non-POST methods', async () => {
    const res = await handler(new Request('http://x/api/admin-logout', { method: 'GET' }));
    expect(res.status).toBe(405);
  });

  it('clears the session cookie with Max-Age=0', async () => {
    const res = await handler(new Request('http://x/api/admin-logout', { method: 'POST' }));
    expect(res.status).toBe(200);
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('admin_session=;');
    expect(cookie).toContain('Max-Age=0');
    expect(cookie).toContain('HttpOnly');
  });
});
