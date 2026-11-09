# AURA. Hostess & Events – weboldal

B2B ajánlatkérő weboldal a pécsi AURA. Hostess & Events számára. Készítette az **AImpress**.

- **Technika:** Astro 7 + Tailwind CSS 4, statikus oldalak, három szerveroldali űrlap-végpont.
- **Űrlapok:** egy CRM webhookra mennek (`CRM_WEBHOOK_URL`). A visszaigazoló és az utánkövető e-maileket a CRM küldi.
- **Tartalom:** a `content/` mappában van, fejlesztő nélkül szerkeszthető.
- **Fontos fájlok:**
  - [DECISIONS.md](DECISIONS.md) – a meghozott döntések.
  - [CONTENT_TODO.md](CONTENT_TODO.md) – ami még hiányzik.

---

## Gyors indítás

Kell hozzá **Node.js 22.23 vagy újabb** (a fejlesztés Node 24-gyel készült).

```bash
npm install
```

```bash
npm run dev
```

Az oldal a http://localhost:8150 címen nyílik meg. Fejlesztés közben `CRM_WEBHOOK_URL` nélkül az űrlapok csak a terminálba írják ki a beküldött adatot.

## Parancsok

| Parancs | Mit csinál |
|---|---|
| `npm run dev` | Fejlesztői szerver (8150-es port), automatikus frissítéssel |
| `npm run build` | Build a `dist/` mappába (Netlify-adapterrel). A helyőrzők látszanak – előnézethez. |
| `npm run build:eles` | **Éles build.** Leáll, ha maradt `[[HIÁNYZIK]]`, az árak nincsenek jóváhagyva, nincs `SITE_URL`, vagy egy jogi oldal még vázlat. |
| `npm run preview:node` | Éles build Node-adapterrel, és helyi szerver a 8151-es porton (a `.env` fájlt is betölti) |
| `npm run check` | TypeScript- és Astro-ellenőrzés |
| `npm run helyorzok` | Kilistázza az összes `[[HIÁNYZIK]]` helyőrzőt fájlonként |
| `npm run linkek` | Ellenőrzi a build összes belső linkjét és horgonyát (`npm run build` után) |
| `npm run webhook:teszt` | Helyi teszt-webhook a 8199-es porton. Kiírja és a `teszt-webhook.log` fájlba menti az űrlapokat. `-- --hiba` kapcsolóval 500-as hibát ad. |
| `npm run og` | Újragenerálja az ideiglenes megosztási képet és az ikonokat |

## Környezeti változók

Másold le a `.env.example` fájlt `.env` néven. Élesben a Netlify felületén add meg őket: *Site configuration → Environment variables*.

| Változó | Kötelező | Leírás |
|---|---|---|
| `SITE_URL` | élesben igen | A végleges domain perjel nélkül, pl. `https://www.aurahostess.hu`. Ebből készülnek a canonical URL-ek, a sitemap és az OG-képek linkjei. |
| `CRM_WEBHOOK_URL` | élesben igen | Az AImpress CRM webhookja. Ide megy minden űrlap JSON POST-tal. |
| `CRM_WEBHOOK_SECRET` | nem | Ha be van állítva, minden kérés kap egy `X-Aura-Signature: sha256=<HMAC-SHA256 hex>` fejlécet. A HMAC a nyers törzsből készül, ezzel a titokkal. |
| `PUBLIC_PLAUSIBLE_DOMAIN` | nem | A Plausible-ben felvett domain. Ha üres, nincs mérőkód az oldalon. |
| `PUBLIC_PLAUSIBLE_SRC` | nem | A Plausible szkript URL-je. Alapértelmezés: `https://plausible.io/js/script.js`. Ha a fiók egyedi szkriptet ad, ide kell beírni. |
| `DEPLOY_TARGET` | nem | `netlify` (alapértelmezés) vagy `node` (saját szerver) |
| `ROBOTS_NOINDEX` | nem | `1` esetén a robots.txt mindent tilt (pl. teszt-domainen). Netlify-előnézeten ez automatikus. |

## Hol szerkeszthető a tartalom?

Minden szöveg, ár, GYIK és referencia a **`content/hu/`** mappában van. A fájlok elején megjegyzések magyarázzák a mezőket.

| Fájl | Mi van benne |
|---|---|
| `content/hu/ceg.yaml` | Cégadatok: telefon, e-mail, Instagram, cím, válaszidő, korhatár |
| `content/hu/arazas.yaml` | Óradíj, kiállási díj, előadóest-csomag, lemondás, fizetés. Jóváhagyás után: `jovahagyva: true` |
| `content/hu/gyik.yaml` | Gyakori kérdések. Az `oldalak:` mező mondja meg, hol jelennek meg. |
| `content/hu/referenciak.yaml` | Esettanulmányok és megbízói logók (csak engedéllyel) |
| `content/hu/felulet.yaml` | Menü, gombfeliratok, űrlapcímkék, hibaüzenetek, lábléc |
| `content/hu/oldalak/*.yaml` | Oldalanként: keresőcím (`seo.title`, max. 70 karakter), leírás (`seo.description`, max. 170 karakter), a fejrész és a szekciók szövegei |
| `content/hu/jogi/*.md` | Impresszum és adatkezelési tájékoztató (Markdown) |
| `content/fotok/` | Ide kerülnek a valódi fotók és a megbízói logók |

**Szabályok a szerkesztéshez:**

- **`{kapcsos}` részek** – pl. `{telefon}`, `{valaszido}`, `{oradij}`: ide a rendszer illeszti be az értéket a `ceg.yaml`-ből vagy az `arazas.yaml`-ből. Ne töröld őket. A `{Valaszido}` (nagy kezdőbetűvel) mondat elejére való.
- **`[[HIÁNYZIK: …]]`** – sárgán látszik az oldalon. Írd át a valódi szövegre. Az éles build addig leáll.
- **`**félkövér**`** – a szövegekben működik.
- **Fotó cseréje:**
  1. Tedd a képet a `content/fotok/` mappába (JPG, PNG vagy WebP, legalább 1600 px széles).
  2. A helyőrző `foto:` blokkjába írd be:

     ```yaml
     foto:
       leiras: "FOTÓ: regisztrációs pult"
       fajl: "regisztracio.jpg"
       alt: "Két hostess fogadja a vendégeket a regisztrációs pultnál"
     ```

  3. A kép automatikusan AVIF/WebP formátumú lesz, több méretben, lusta betöltéssel. Az `alt` kötelező.
- **Ha elírás van egy fájlban** (pl. hiányzik egy kötelező mező, vagy túl hosszú a keresőcím), a build megáll, és megmondja a fájlt és a mezőt.
- **YAML-ban** a behúzás (szóközök) számít. Az idézőjeles szövegeken belül nyugodtan használhatsz „magyar idézőjelet”.

## Űrlapok és CRM

| Űrlap | Hol van | Végpont | `tipus` |
|---|---|---|---|
| Ajánlatkérő (2 lépés) | Főoldal, Rendezvény-hostess, Előadóestek, Árak | `POST /api/ajanlatkeres/` | `ajanlatkeres` |
| Hostess-jelentkezés | Jelentkezés hostessnek | `POST /api/jelentkezes/` | `jelentkezes` |
| Kapcsolat | Kapcsolat | `POST /api/kapcsolat/` | `kapcsolat` |

**Működés:**
- A böngészőben és a szerveren ugyanazok az ellenőrzési szabályok futnak (`src/lib/urlap-szabalyok.ts`).
- Spamszűrés: csalimező és 2,5 másodperces időcsapda. A spam csendben „sikert” kap, de nem megy tovább a CRM-be.
- Siker után: átirányítás a `/koszonjuk/?tipus=…` oldalra. Ott mérjük a konverziót.
- Ha a CRM nem válaszol (8 mp időkorlát): hibaüzenet telefonszámmal, nincs átirányítás.
- JS nélkül is működik: sima POST, 303-as átirányítás, hiba esetén egyszerű hibaoldal.

**A CRM-nek küldött JSON:**

```json
{
  "tipus": "ajanlatkeres",
  "nyelv": "hu",
  "adatok": {
    "nev": "…", "szervezet": "…", "email": "…", "telefon": "…",
    "datum": "2026-12-05", "helyszin": "…", "rendezveny_tipusa": "gala",
    "letszam": 4, "idotartam": "18:00–22:00", "feladatok": ["regisztracio", "protokoll"],
    "oltozet": "", "nyelvi_igeny": "", "megjegyzes": "…", "adatkezeles": true
  },
  "meta": {
    "oldal": "/rendezveny-hostess-pecs/",
    "utm": { "utm_source": "instagram", "utm_campaign": "osz" },
    "kuldes_ideje_bongeszo": "2026-11-09T10:57:01.243Z",
    "fogadva": "2026-11-09T10:57:01.435Z",
    "adatkezelesi_tajekoztato_verzio": "2026-11-09"
  }
}
```

A többi űrlap mezői:
- **`jelentkezes`:** `nev`, `email`, `telefon`, `varos`, `eletkor` (true), `nyelvek`, `napok` (tömb: `hetfo` … `vasarnap`), `tapasztalat`, `profil`, `adatkezeles`.
- **`kapcsolat`:** `nev`, `email`, `telefon`, `uzenet`, `adatkezeles`.

A választható értékek listája:
- `rendezveny_tipusa`: `konferencia`, `gala`, `vip_fogadas`, `eloadoest`, `egyeb`.
- `feladatok`: `regisztracio`, `vendegfogadas`, `iranyitas`, `protokoll`, `jegyellenorzes`, `helyre_kiseres`, `ruhatar`, `egyeb`.

**Helyi teszt:**

1. Indítsd el a teszt-webhookot:

   ```bash
   npm run webhook:teszt
   ```

2. A `.env`-ben állítsd be: `CRM_WEBHOOK_URL=http://127.0.0.1:8199/`.
3. Indítsd a fejlesztői szervert, és küldj be egy űrlapot.

## Mérés (Plausible, cookie nélkül)

Ezeket az eseményeket érdemes **célként (Goal)** felvenni a Plausible-ben:
- `Ajánlatkérés elküldve`
- `Jelentkezés elküldve`
- `Kapcsolat-üzenet elküldve`
- `Telefonszám kattintás`
- `E-mail kattintás`
- `Instagram kattintás`

A kattintásos események `hely` tulajdonsága megmutatja, hol kattintottak: `hero`, `fejlec`, `lablec`, `mobil-sav`, `ajanlat-szekcio`…

A mérőkód csak a `PUBLIC_PLAUSIBLE_DOMAIN` beállítása után töltődik be. Az oldal nem használ sütit, és nem tárol semmit a böngészőben, ezért nincs cookie-sáv. Ha később GA4 vagy hirdetési pixel kerül rá, akkor hozzájárulási sáv kell, a csere helye pedig az `src/scripts/meres.ts`.

## Telepítés (Netlify)

1. Töltsd fel a projektet egy Git-tárolóba (GitHub). A `.env` nem kerül fel.
2. A Netlifyban: *Add new site → Import an existing project* → válaszd ki a tárolót. A build-beállításokat a `netlify.toml` adja.
3. Add meg a környezeti változókat: `SITE_URL`, `CRM_WEBHOOK_URL`, opcionálisan `CRM_WEBHOOK_SECRET` és `PUBLIC_PLAUSIBLE_DOMAIN`.
4. **Előnézet:** a branch- és deploy-preview telepítések az `npm run build` paranccsal futnak. A helyőrzők látszanak, és a robots.txt mindent tilt.
5. **Élesítés:** az éles telepítés (`[context.production]`) az `npm run build:eles` parancsot futtatja. Ez szándékosan leáll, amíg a [CONTENT_TODO.md](CONTENT_TODO.md) tételei nincsenek kész.
6. Kösd be a saját domaint (*Domain management*), és ellenőrizd, hogy a `SITE_URL` ugyanez legyen.

**Saját szerver (Node) helyett:** `DEPLOY_TARGET=node npm run build`, majd `node dist/server/entry.mjs`. A `HOST` és a `PORT` környezeti változóval állítható. Itt a `public/_headers` biztonsági fejléceit a webszervernek (pl. nginx) kell beállítania.

## Ellenőrzés (2026-11-09)

- **Build és típusok:** `astro build` és `astro check` hiba nélkül (0 hiba, 0 figyelmeztetés).
- **Linkek:** 11 oldal, 416 belső link, mind rendben.
- **Lighthouse (mobil, éles build, helyi szerver):**
  - Teljesítmény: 95–100 minden oldalon.
  - Akadálymentesség, jó gyakorlat, SEO: 100 minden indexelhető oldalon.
  - LCP 0,9–1,4 s, CLS 0.
  - A köszönőoldal SEO-pontja szándékosan alacsony, mert `noindex`.
- **Akadálymentesség:**
  - Kézi ellenőrzés minden oldalon: egy H1, nincs címsorugrás, minden mezőnek van címkéje, nincs dupla azonosító, minden link és gomb kap nevet.
  - Billentyűzet: kiugró link a tartalomra, látható fókusz, a menü Esc-re bezáródik.
  - Csökkentett mozgás beállítás tiszteletben tartva.
- **Mobil:** 360 px-en egyik oldal sem görget vízszintesen.
- **Űrlapok:**
  - Böngészőben: két lépés, hibaüzenetek, beküldés a teszt-webhookra, köszönőoldal és konverziós esemény.
  - Szerveren: hiányos és hibás adat, csalimező, időcsapda, JS nélküli beküldés, CRM-kiesés (502 + hibaüzenet).
  - Idegen Origin: 403.

## Mappastruktúra

```
content/hu/              szerkeszthető tartalom (YAML, Markdown)
content/fotok/           valódi fotók, logók
src/i18n/utak.ts         nyelvek és oldal-URL-ek
src/content.config.ts    a tartalomfájlok sémái
src/nezetek/             oldalnézetek (nyelvfüggetlenek, lang paraméterrel)
src/pages/               vékony oldalfájlok + api/ űrlap-végpontok + robots.txt
src/components/          szekciók, űrlapok (urlap/)
src/lib/                 szövegsegéd, tartalombetöltő, SEO, űrlapszabályok, szerveroldali feldolgozás
src/scripts/             böngészőoldali JS: menü, mérés, UTM, űrlapok
src/styles/global.css    színek, betűk, komponensstílusok
scripts/                 segédszkriptek: helyőrzők, linkek, teszt-webhook, OG-kép
public/                  favicon, OG-kép, _headers
```

## Angol változat hozzáadása

1. `src/i18n/utak.ts`: a `NYELVEK` kapjon egy `'en'` elemet, és minden oldalhoz kerüljön angol útvonal (pl. `rendezveny: { hu: '/rendezveny-hostess-pecs/', en: '/en/event-hostess-pecs/' }`). A `HTML_LANG` és az `OG_LOCALE` is kapjon `en` értéket.
2. `astro.config.mjs`: `i18n.locales: ['hu', 'en']`.
3. Másold a `content/hu/` mappát `content/en/` néven, és fordítsd le.
4. Hozd létre az `src/pages/en/` alatt a vékony oldalfájlokat. Ugyanazokat a nézeteket hívják `lang="en"`-nel, pl. `<Rendezveny lang="en" />`.
5. A hreflang-címkék automatikusan megjelennek, amint két nyelv van.

## Ismert korlátok

- **Jogi szöveg:** az Adatkezelési tájékoztató vázlat. Szakemberrel ellenőriztetni kell.
- **Ideiglenes arculati elemek:** a logó, a favicon és az OG-kép a logó vektoros fájljából cserélendő.
- **Spamszűrés:** a végpontokon nincs IP-alapú korlátozás. Ha mégis spam érkezik, Netlify-szinten bekapcsolható.
- **CRM-kiesés:** nincs automatikus újraküldés. A látogató hibaüzenetet és telefonszámot lát.
