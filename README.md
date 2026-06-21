# filadelfia.live

Aplicație web (PWA) pentru **Biserica Filadelfia Petroșani** — program săptămânal,
evenimente, transmisiuni live YouTube, plan de citire, știri, contact și notificări push
„când începe live-ul".

## Stack

- **React 19** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** + componente Radix UI (shadcn-style în `src/components/ui`)
- **React Router 6**
- **Firebase Realtime Database** (prin REST, fără SDK) — conținut editabil din `/admin`
- **EmailJS** — formularul de contact
- **Vercel Functions** (`api/*.ts`) — detectare live YouTube
- **PWA** prin `vite-plugin-pwa` (service worker, instalabilă pe telefon)
- Hostat pe **Vercel**

## Pornire locală

```bash
npm install
npm run dev        # http://localhost:5173
```

> Funcțiile din `api/` **nu rulează** cu `vite dev` (plain). Pentru a le testa local
> ai nevoie de `vercel dev`. Fără ele, detectarea live și push-ul nu funcționează local —
> aplicația funcționează în rest cu fallback pe `localStorage`.

## Scripturi

| Comandă | Ce face |
|---|---|
| `npm run dev` | Server de dezvoltare Vite |
| `npm run build` | Build de producție (`dist/`) |
| `npm run preview` | Servește build-ul local |
| `npm run check` | Type-check (`tsc --noEmit`) |
| `npm run lint` | Alias pentru `check` |
| `npm test` | Teste unitare (Vitest) |
| `npm run test:e2e` | Teste E2E (Playwright, Desktop Chrome) |
| `npm run test:all` | Unit + E2E |

## Configurare (variabile de mediu)

Majoritatea conținutului se editează din `src/data/site-config.json` (nume biserică, program
implicit, text ticker, ID canal/playlist YouTube) — fără variabile de mediu.

Serviciile externe au nevoie de variabilele de mai jos. Cele cu prefix `VITE_` ajung în
bundle-ul client (sunt publice); restul sunt **doar pe server** (Vercel) și nu trebuie expuse.

### Client (`VITE_`)

| Variabilă | Folosită pentru |
|---|---|
| `VITE_FIREBASE_DB_URL` | URL-ul Realtime Database (citire conținut) |

### Server (doar Vercel — **nu** prefix `VITE_`)

| Variabilă | Folosită pentru |
|---|---|
| `FIREBASE_DB_URL` | URL-ul Realtime Database (scriere din funcții) |
| `FIREBASE_DB_SECRET` | Secret de acces la DB pentru funcții |
| `ADMIN_PIN` | PIN-ul de acces la `/admin` (4 cifre) — validat server-side |
| `ADMIN_SESSION_SECRET` | Cheie aleatoare pentru semnarea cookie-ului de sesiune admin |
| `EMAILJS_SERVICE_ID` | EmailJS — formular contact (trimitere server-side) |
| `EMAILJS_TEMPLATE_ID` | EmailJS — formular contact |
| `EMAILJS_PUBLIC_KEY` | EmailJS — cheia publică (user_id) |
| `EMAILJS_PRIVATE_KEY` | EmailJS — cheia privată (accessToken); necesită „Allow API for non-browser" în dashboard |
| `YOUTUBE_API_KEY` | YouTube Data API — detectare live |
| `YOUTUBE_CHANNEL_ID` | ID-ul canalului YouTube |

> Autentificarea de admin e server-side: `/api/admin-login` validează `ADMIN_PIN` și emite un
> cookie semnat (HttpOnly), iar `/api/db-write` îl cere. PIN-ul **nu** mai e expus în client.

## Structură

```
api/                 Vercel Functions (serverless)
  live-status.ts     detectează dacă există transmisie live pe YouTube
  admin-login.ts     login admin (validează PIN, emite cookie de sesiune)
  db-write.ts        scriere în Realtime Database (cere sesiune admin)
  contact.ts         trimite formularul de contact (EmailJS server-side + rate-limit)
  _auth.ts           helpere sesiune admin (HMAC, cookie)
src/
  pages/             paginile (Home, Live, Contact, Admin, Știri, Despre, Plan citire)
  components/         componente UI + Layout
  data/              site-config.json, schedule.json (conținut implicit)
  lib/db.ts          helpere REST pentru Firebase RTDB
```

## Zona Admin (`/admin`)

Protejată cu PIN (`VITE_ADMIN_PIN`). De aici se editează: evenimente, program săptămânal,
mod mentenanță, banner de anunț. Conține și un card **„Status servicii"** care verifică în
timp real dacă Firebase și funcțiile Vercel răspund.

## Deploy

Push pe branch → Vercel face build automat (`npm run build`, output `dist/`).
Rutarea SPA și headerele de securitate sunt în `vercel.json`. Variabilele de mediu se
setează în dashboard-ul Vercel, per environment.
