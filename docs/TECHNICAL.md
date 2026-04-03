# Documentație tehnică — filadelfia.live

## Stack

| Tehnologie | Versiune | Rol |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool |
| TailwindCSS | 3 | Styling |
| React Router | 6 | Routing |
| Firebase Realtime DB | 10 | Date dinamice (events, schedule) |
| Playwright | latest | Teste e2e |
| Vitest | latest | Teste unitare |
| Vercel | — | Hosting & deploy |

---

## Setup local

### 1. Clonează repo-ul
```bash
git clone <repo-url>
cd filadelfia.live
npm install
```

### 2. Variabile de mediu
Creează un fișier `.env.local` în rădăcina proiectului:
```env
VITE_FIREBASE_DB_URL=https://<your-project>.firebasedatabase.app
```

### 3. Pornește dev server
```bash
npm run dev
```
Site-ul va fi disponibil la `http://localhost:5173`.

---

## Structura proiectului

```
src/
├── pages/          # O pagină = un fișier
│   ├── HomePage.tsx
│   ├── LivePage.tsx
│   ├── ReadingPlanPage.tsx
│   ├── ContactPage.tsx
│   ├── StiriPage.tsx
│   └── AdminPage.tsx
├── components/     # Componente reutilizabile
│   ├── ui/         # Componente de bază (Button, Card, etc.)
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── LivePlayer.tsx
│   └── ...
├── data/           # Date statice JSON
│   ├── site-config.json   # Configurare generală
│   ├── schedule.json      # Program servicii (default)
│   ├── events.json        # Evenimente (default)
│   ├── verses.json        # Versete zilnice
│   ├── reading-plan.json  # Plan de citire biblic
│   └── holidays.json      # Sărbători românești
├── lib/
│   └── db.ts       # Wrapper Firebase (dbRead / dbWrite)
├── utils/          # Logică pură, fără UI
│   ├── date.ts
│   ├── schedule.ts
│   ├── verse.ts
│   └── holidays.ts
└── styles/
    └── global.css
```

---

## Firebase

### Structura bazei de date
```
/
├── events/     # Array de evenimente custom adăugate din Admin
├── schedule/   # Array de servicii modificate din Admin
└── pin/        # PIN-ul de admin (hash)
```

### Acces
- **Citire publică**: events, schedule
- **Scriere**: doar din Admin (protejat prin PIN)

### `dbRead` / `dbWrite`
```ts
import { dbRead, dbWrite } from '@/lib/db';

// Citire
const events = await dbRead<Event[]>('events');

// Scriere
await dbWrite('events', updatedEvents);
```

---

## Deploy

Deploy-ul se face automat prin **Vercel** la fiecare push pe branch-ul `main`.

```bash
git add .
git commit -m "mesaj"
git push origin main
```

Vercel detectează automat Vite și configurează build-ul.

### Build manual
```bash
npm run build      # Generează dist/
npm run preview    # Previzualizează build-ul local
```

---

## Teste

### E2E (Playwright)
```bash
npx playwright test                          # Toate testele
npx playwright test --ui                     # Interfață grafică
npx playwright test e2e/pages.spec.ts        # Un fișier specific
npx playwright test --project="Mobile Chrome" # Doar mobile
npx playwright test --update-snapshots       # Actualizează visual baselines
```

### Unit (Vitest)
```bash
npm run test
```

---

## Configurare site

Editează `src/data/site-config.json` pentru:
- Nume biserică, tagline, descriere
- Adresă și link hartă
- Link-uri YouTube și Facebook
- Ferestre de timp pentru detectarea live-ului

---

## Performanță

- **FCP**: ~0.6s, **LCP**: ~0.8s, **CLS**: 0
- Imagini preloaded (`image_bg.jpg`, `logo.png`)
- Firebase reads wrapped în `startTransition` pentru INP mai bun
- Cache localStorage pentru events și schedule (fallback instant)
- Visual snapshots actualizate automat în CI

---

## Variabile de mediu necesare în Vercel

| Variabilă | Descriere |
|---|---|
| `VITE_FIREBASE_DB_URL` | URL-ul bazei de date Firebase |
