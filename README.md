# filadelfia-petrosani.ro

Website-ul **Biserica Filadelfia Petroșani** — program săptămânal,
evenimente, transmisiuni live YouTube, plan de citire și contact.

## Stack

- **React 19** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** + componente Radix UI (shadcn-style în `src/components/ui`)
- **React Router 6**
- **SQLite** local (`node:sqlite`, nativ Node 22) — conținut editabil din `/admin`
- **Maileroo** — formularul de contact (API REST)
- Server API mic (**Hono** + `@hono/node-server`, bundle single-file cu esbuild) — detectare
  live YouTube, login admin, scriere/citire conținut, contact
- **PWA** prin `vite-plugin-pwa` (service worker, instalabilă pe telefon)
- Hostat pe **VPS Hostinger** (Ubuntu 24.04) — nginx (static + reverse-proxy) + pm2

## Pornire locală

```bash
npm install
npm run dev        # frontend Vite, http://localhost:5173
npm run dev:server  # server API (Hono), http://localhost:3001 — necesar pt /api/*
```

Fără `dev:server` rulând, cererile către `/api/*` (login admin, live YouTube, contact,
citire/scriere conținut) eșuează local — aplicația rămâne funcțională în rest, cu fallback
pe `localStorage` unde e cazul.

## Scripturi

| Comandă | Ce face |
|---|---|
| `npm run dev` | Server de dezvoltare Vite (frontend) |
| `npm run dev:server` | Server API local (Hono, pentru `/api/*`) |
| `npm run build` | Build de producție frontend (`dist/`) |
| `npm run preview` | Servește build-ul local |
| `npm run check` | Type-check (`tsc --noEmit`) |
| `npm run lint` | Alias pentru `check` |
| `npm test` | Teste unitare (Vitest) |
| `npm run test:e2e` | Teste E2E (Playwright, Desktop Chrome) |
| `npm run test:all` | Unit + E2E |

## Configurare (variabile de mediu)

Majoritatea conținutului se editează din `src/data/site-config.json` (nume biserică, program
implicit, text ticker, ID canal/playlist YouTube) — fără variabile de mediu.

Variabilele de mai jos sunt citite **doar server-side** de `server/index.ts` (Node, pe VPS sub
pm2) — nu au prefix `VITE_`, nu ajung în bundle-ul client.

| Variabilă | Folosită pentru |
|---|---|
| `ADMIN_PIN` | PIN-ul de acces la `/admin` — validat server-side |
| `ADMIN_SESSION_SECRET` | Cheie aleatoare pentru semnarea cookie-ului de sesiune admin |
| `YOUTUBE_API_KEY` | YouTube Data API — detectare live |
| `YOUTUBE_CHANNEL_ID` | ID-ul canalului YouTube |
| `MAILEROO_API_KEY` | Maileroo — formular contact |
| `MAILEROO_FROM_ADDRESS` | Adresă expeditor, pe domeniul verificat în Maileroo |
| `MAILEROO_FROM_NAME` | Nume expeditor afișat |
| `MAILEROO_TO_ADDRESS` | Adresa unde ajung mesajele din formularul de contact |
| `DB_PATH` | Opțional — calea fișierului SQLite (implicit `./data/app.db`) |

> Autentificarea de admin e server-side: `/api/admin-login` validează `ADMIN_PIN` și emite un
> cookie semnat (HttpOnly), iar `/api/db-write` îl cere. PIN-ul nu e expus în client.

## Structură

```
api/                 handlere server (Request -> Promise<Response>), montate de server/index.ts
  live-status.ts     detectează dacă există transmisie live pe YouTube
  admin-login.ts     login admin (validează PIN, emite cookie de sesiune, rate-limit)
  db-write.ts        scriere în SQLite (cere sesiune admin, allowlist de căi)
  db-read.ts         citire publică din SQLite (allowlist de căi)
  contact.ts         trimite formularul de contact (Maileroo + rate-limit)
  _auth.ts           helpere sesiune admin (HMAC, cookie, cheie IP client)
  _db.ts             wrapper key-value peste node:sqlite
server/index.ts       server Hono care montează handlerele din api/ ca rute HTTP
src/
  pages/             paginile (Home, Live, Contact, Admin, Plan citire)
  components/         componente UI + Layout
  data/              site-config.json, schedule.json (conținut implicit)
  lib/db.ts          helpere fetch către /api/db-read și /api/db-write
```

## Zona Admin (`/admin`)

Protejată cu PIN (validat server-side, vezi `ADMIN_PIN`). De aici se editează: evenimente,
program săptămânal, mod mentenanță, banner de anunț. Conține și un card **„Status servicii"**
care verifică în timp real dacă baza de date locală și server-ul API răspund.

## Deploy

Build frontend (`npm run build` → `dist/`) și bundle server (`esbuild server/index.ts --bundle
--platform=node --target=node22 --format=esm --outfile=server-dist/server.mjs`), copiate pe VPS
în `/var/www/filadelfia/`. nginx servește `dist/` static și face reverse-proxy `/api/*` către
serverul Node (`127.0.0.1:3001`, pornit cu `pm2`, user dedicat non-root `filadelfia`). Headerele
de securitate (CSP, HSTS etc.) sunt în vhost-ul nginx, nu în `vercel.json` (nu se mai folosește).
