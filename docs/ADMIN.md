# Ghid de administrare — filadelfia.live

## Accesarea panoului de administrare

Mergi la `https://filadelfia-petrosani.ro/admin` și introdu codul PIN.

> Codul PIN se setează în Firebase și nu este stocat în cod.

---

## Evenimente

### Adaugă un eveniment
1. În panoul Admin, secțiunea **Evenimente**, apasă **Adaugă**
2. Completează:
   - **Titlu** — numele evenimentului (ex. „Conferință de tineret")
   - **Data de început** — ziua / luna / anul
   - **Data de sfârșit** — opțional, pentru evenimente multi-zi
   - **Ora** — opțional (ex. „18:00")
   - **Locație** — opțional (ex. „Sala de conferințe")
   - **Descriere** — opțional, detalii suplimentare
   - **Link înregistrare** — opțional, URL extern
   - **Etichete** — opțional (ex. „tineret", „copii")
3. Apasă **Salvează evenimentul**

### Șterge un eveniment
- Apasă iconița de ștergere (🗑) de lângă eveniment
- Confirmă în dialogul apărut
- Ai la dispoziție **5 secunde** să anulezi ștergerea din banner-ul care apare

### Evenimentele pe site
- Apar în secțiunea **Evenimente** de pe pagina principală
- Se afișează doar evenimentele viitoare, ordonate cronologic
- Se pot scrola dacă sunt mai multe

---

## Program săptămânal

Programul serviciilor (duminică dimineață, duminică seara, joi) se gestionează din panoul Admin, secțiunea **Program**.

Fiecare serviciu are:
- **Zi** — ziua săptămânii
- **Ora de început / sfârșit**
- **Titlu** — numele serviciului
- **Live** — bifat dacă se transmite pe YouTube

> Modificările se salvează automat în Firebase și apar pe site imediat.

---

## Live

Site-ul detectează automat dacă ești în fereastra de timp a unui serviciu și afișează player-ul live.

Ferestrele de timp implicite (configurate în `src/data/site-config.json`):
- **Duminică dimineață**: 10:00 – 12:00
- **Duminică seara**: 18:00 – 20:00
- **Joi**: 18:00 – 20:00

Dacă transmisia începe mai devreme sau mai târziu, modifică orele din fișierul de configurare (necesită acces tehnic).

---

## Versetul zilei

Versetele se rotesc automat din fișierul `src/data/verses.json`. Nu necesită intervenție manuală — se schimbă zilnic în funcție de data curentă.

Pentru a adăuga sau modifica versete, editează fișierul JSON (necesită acces tehnic).

---

## Planul de citire

Planul anual de citire biblică este definit în `src/data/reading-plan.json`. Se avansează automat zilnic.

Pentru a schimba planul, înlocuiește fișierul JSON cu noul plan (necesită acces tehnic).

---

## Știri

Știrile se încarcă automat de la **crestintotal.ro** (categorie creștină). Nu necesită intervenție — se actualizează la fiecare 2 ore.

---

## Întrebări frecvente

**Site-ul nu arată evenimentele noi imediat.**
Datele sunt cache-uite local în browser. Se actualizează la prima vizită după ce cache-ul expiră sau la un refresh forțat (`Ctrl+Shift+R`).

**Playerul Live nu pornește automat.**
Intenționat — userul trebuie să apese Play pentru a evita problemele cu sunetul pe mobile.

**Meniul burger nu se închide.**
Apasă în afara meniului sau apasă butonul X. Pe mobil, tap în afara meniului îl închide automat.
