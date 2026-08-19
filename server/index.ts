// Server Node pentru VPS — înlocuiește Vercel Edge Functions.
// Reutilizează neschimbate handler-ele din api/*.ts (Request -> Promise<Response>).
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import adminLogin from '../api/admin-login';
import adminLogout from '../api/admin-logout';
import dbWrite from '../api/db-write';
import dbRead from '../api/db-read';
import liveStatus from '../api/live-status';
import contact from '../api/contact';

const app = new Hono();

app.post('/api/admin-login', (c) => adminLogin(c.req.raw));
app.post('/api/admin-logout', (c) => adminLogout(c.req.raw));
app.post('/api/db-write', (c) => dbWrite(c.req.raw));
app.get('/api/db-read', (c) => dbRead(c.req.raw));
app.get('/api/live-status', () => liveStatus());
app.post('/api/contact', (c) => contact(c.req.raw));

const port = Number(process.env.PORT ?? 3001);
// Doar loopback — nginx face reverse-proxy și setează X-Real-IP; dacă procesul ar fi
// accesibil direct din exterior, un atacator ar putea falsifica X-Real-IP și ocoli
// rate-limiting-ul per-IP din api/_auth.ts.
serve({ fetch: app.fetch, port, hostname: '127.0.0.1' });
console.log(`[server] listening on 127.0.0.1:${port}`);
