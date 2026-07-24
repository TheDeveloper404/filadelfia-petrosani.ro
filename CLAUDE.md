# CLAUDE.md — filadelfia.live

Regulile de proces generale (clasificare SMALL/NORMAL/CRITICAL, quality gates, mod de lucru cu
Liviu) trăiesc în instrucțiunile globale. Acest fișier conține DOAR ce e specific acestui proiect.

## Convenții rapide

Tipare mici, ca să nu mai fie nevoie de întrebări repetate pe lucruri banale. Secțiune nouă
(2026-07-24) — încă neconfirmată empiric pe acest proiect (spre deosebire de Seminar, unde
tiparul de screenshot-uri în rădăcină e deja documentat din sesiuni anterioare):

- Nu s-a stabilit încă unde aterizează fișierele ad-hoc (poze/screenshot-uri) trimise de user în
  timpul unei sesiuni pe acest proiect — de confirmat prima dată când se întâmplă, apoi documentat
  aici ca fapt, nu presupunere.
- (Secțiune vie — se extinde pe măsură ce apar tipare noi confirmate.)

## Deploy — regulă obligatorie

**Site-ul rulează pe VPS Hostinger (Ubuntu 24.04), NU pe Vercel.** Orice schimbare de cod trebuie
deployată pe VPS **de către Claude**, nu de user — userul nu face deploy manual pentru acest
proiect. Un task nu e "gata" doar pentru că a fost comis local; se termină după deploy confirmat.

- Acces: `ssh -i ~/.ssh/id_ed25519_filadelfia_vps filadelfia@31.97.47.182` — cheie SSH dedicată
  (2026-07-23, înainte se folosea root + `sudo -u filadelfia`, la fel ca la Seminar acum).
  Aplicația rulează sub acest user dedicat non-root; procesul pm2 se numește `filadelfia-api`.
  Pentru operații care chiar necesită root (ex. editare nginx), conectare separată ca root.
- Cale pe VPS: `/var/www/filadelfia/` (`dist/` = build frontend, `server-dist/server.mjs` = bundle
  server, `data/` = SQLite, `.env` = secrete server-side, NU se ating manual fără motiv).
- nginx: vhost `filadelfia-app` (static `dist/` + reverse-proxy `/api/*` → `127.0.0.1:3001`).
- Pe aceeași mașină mai există un site separat (`seminar-app`, altă cheie SSH) — nu amesteca
  fișierele sau pm2-urile celor două. Ambele proiecte sunt ale aceluiași client (Biserica
  Filadelfia + Seminarul ei teologic) — vezi `reference_shared_client_filadelfia_seminar.md` în
  memorie pentru relația completă.

**Pași de deploy (2026-07-23, unificat cu procesul de la Seminar) — NICIODATĂ build local, totul
se face PE VPS, sursa vine prin tar+scp de pe disc local, NU prin `git clone`/`git pull` (asta
elimină dependența de un push pe GitHub înainte de deploy):**
1. Local: `tar czf deploy.tar.gz index.html src api server public package.json package-lock.json
   vite.config.ts tsconfig.json tailwind.config.mjs postcss.config.cjs postcss.config.js`
2. `scp -i ~/.ssh/id_ed25519_filadelfia_vps deploy.tar.gz filadelfia@31.97.47.182:/home/filadelfia/src/filadelfia.live/`
3. `ssh -i ~/.ssh/id_ed25519_filadelfia_vps filadelfia@31.97.47.182` → `cd
   /home/filadelfia/src/filadelfia.live && tar xzf deploy.tar.gz && rm deploy.tar.gz` (suprascrie
   fișierele existente direct, nu prin git — folderul păstrează `.git` din trecut dar nu mai e
   folosit ca sursă de adevăr; nu mai e nevoie de `chown`, fișierele sosesc deja ca `filadelfia`)
4. Tot ca `filadelfia`: `npm ci --no-audit --no-fund` → `npm run build` → `npx esbuild
   server/index.ts --bundle --platform=node --target=node22 --format=esm
   --outfile=server-dist/server.mjs`
5. Copiază `dist/` și `server-dist/server.mjs` din folderul sursă în `/var/www/filadelfia/` (swap
   simplu: `mv dist dist.old` → copiază noul `dist` → șterge `dist.old`; NU atinge `.env` sau
   `data/` din producție, alea nu sunt în folderul sursă)
6. `pm2 restart filadelfia-api` (ca `filadelfia`, fără `sudo -u` — sesiunea SSH e deja userul corect)
7. Verifică pe domeniul real (`curl -w '%{http_code}' https://filadelfia-petrosani.ro/` +
   `/api/live-status`) — nu pe IP/127.0.0.1 fără Host header, dă fals 404/301

Root rămâne necesar doar pentru operații de infrastructură (nginx, ufw, alți useri) — conectare
separată `ssh root@31.97.47.182` pentru acelea, nu pentru deploy-ul obișnuit.

Detalii complete în memoria de proiect (`project_deploy.md`).

## Stack (actual, iulie 2026)

- React 19 + TypeScript + Vite 5 + Tailwind + Radix UI (shadcn-style, `src/components/ui`)
- Server API: Hono + `@hono/node-server`, bundle single-file cu esbuild (`server/index.ts` →
  `api/*.ts` handlere)
- SQLite (`node:sqlite`) pentru conținut editabil din `/admin`
- Maileroo pentru formularul de contact (NU EmailJS, NU Firebase — proiectul a migrat de pe
  Vercel/Firebase pe VPS + Node/SQLite)
- PWA (`vite-plugin-pwa`)

Vezi `README.md` pentru variabile de mediu server-side (`ADMIN_PIN`, `YOUTUBE_API_KEY`,
`MAILEROO_*`, etc.) și structura completă a directoarelor.

## Teste

- `npm run check` — type-check (`tsc --noEmit`) — rulează-l după orice schimbare de tipuri/schemă.
- `npm test` — unit (Vitest).
- `npm run test:e2e` — E2E (Playwright) — verifică dacă proiectul are marker `HUMAN_RUNS_TESTS`
  înainte de a rula tu teste e2e (regulă globală de split unit/e2e).
