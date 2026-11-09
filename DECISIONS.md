# Döntések – AURA. Hostess & Events weboldal

Ahol a briefből vagy a jóváhagyott tervből hiányzott egy információ, a szakmailag legjobb alapértelmezést választottam. Itt minden ilyen döntés szerepel: **mi**, **miért**, és **hogyan változtatható**.

A jóváhagyott terv (2026-11-09) alapértelmezései:
- Netlify tárhely.
- Plausible mérés.
- A 72 000 Ft-os csomagár helyőrzővel.
- Tegező toborzóoldal.
- A domain helyőrzővel.

---

## Technika

| # | Döntés | Miért | Változtatás |
|---|---|---|---|
| T1 | **Astro 7.4 + Tailwind CSS 4.3**, TypeScript. Nem volt megadott AImpress-stack. | A brief alapértelmezése. Ez volt a build napján a legfrissebb stabil verzió. | – |
| T2 | **Statikus oldalak.** Szerveren csak a 3 űrlap-végpont (`/api/*`) és a `/koszonjuk/` fut. | Gyors és olcsó. A webhook-URL titok, ezért nem kerülhet a böngészőbe. | – |
| T3 | **Netlify-adapter az alapértelmezés.** `DEPLOY_TARGET=node` esetén Node-szerver (saját VPS, helyi éles teszt). | A Netlify ingyenes csomagja üzleti célra is használható. A Node-ág arra az esetre van, ha másik tárhely lesz. | `DEPLOY_TARGET` környezeti változó |
| T4 | A **`/koszonjuk/` szerveren renderelődik** (`?tipus=…`). | JS nélkül is a megfelelő köszönőszöveg látszik. A mérés is itt történik. | `src/pages/koszonjuk.astro` |
| T5 | **Záró perjeles URL-ek** (`/arak/`). A slugok magyarok és kulcsszavasak. | Egységes canonical, Netlify-barát. | `src/i18n/utak.ts` |
| T6 | **Felkészítés angolra.** Az útvonalak nyelvenként egy fájlban, a nézetek `lang` paramétert kapnak, a tartalom `content/<nyelv>/` alatt van. A hreflang-címkék 2+ nyelvtől jelennek meg. | A brief kérése. Az angol most nem készült el. | README → „Angol változat” |
| T7 | **Tartalom YAML- és Markdown-fájlokban** (`content/hu/`), sémával ellenőrizve. | Fejlesztő nélkül is szerkeszthető. Elírásnál a build érthető hibaüzenettel áll le. | Később Git-alapú szerkesztőfelület (pl. Pages CMS) köthető rá. |
| T8 | A **`{tokenek}`** (pl. `{telefon}`, `{valaszido}`) egy helyről töltődnek ki. A `{Valaszido}` alak mondat elején nagy kezdőbetűt ad. | Egy adat csak egy helyen él, nem lehet ellentmondás. | `src/lib/tartalom.ts → tokenErtekek` |
| T9 | **Biztonság.** Astro beépített Origin-ellenőrzés (CSRF), Netlify-biztonsági fejlécek (`public/_headers`), opcionális HMAC-aláírás a webhookon. | Alapszintű védelem plusz munka nélkül. | `CRM_WEBHOOK_SECRET` |

## Űrlapok és CRM

| # | Döntés | Miért |
|---|---|---|
| U1 | **Az ajánlatkérő egyetlen űrlap két lépésben.** A 2. lépés minden mezője önkéntes. A hozzájárulás és a küldés gomb a végén van. JS nélkül egyetlen hosszú űrlapként működik. | Rövidnek tűnik, de nincs belőle két külön beküldés. |
| U2 | **Az 1. lépés után nem küldünk részleges leadet a CRM-be.** | A hozzájárulás a beküldésnél történik. Ha kell, később hozzájárulással megoldható. |
| U3 | **Ugyanazok az ellenőrzési szabályok futnak a böngészőben és a szerveren** (`src/lib/urlap-szabalyok.ts`). A hibaüzenetek kulcsok, a szövegük a `felulet.yaml`-ben van, magázó és tegező változatban. | Nem csúszhat szét a két oldal szabálya. |
| U4 | **Spamszűrés:** csalimező (`weboldal`) és időcsapda (2,5 mp alatti kitöltés). A spam „sikert” kap, de nem megy tovább. | Captcha nélkül. A bot nem tudja meg, hogy kiszűrtük. |
| U5 | **„Melyik oldalról jött”** = a beküldés oldala (`meta.oldal`) és az UTM-paraméterek. Referrert, IP-címet és böngészőadatot nem küldünk. | Adattakarékosság (GDPR). |
| U6 | **Az UTM-ek tárolás nélkül maradnak meg:** érkezéskor a belső linkekhez fűzzük őket, így más aloldalon beküldve is megmaradnak. | Semmit nem tárolunk a böngészőben, ezért nem kell cookie-sáv. |
| U7 | A payload tartalmazza a **hozzájárulás tényét és az adatkezelési tájékoztató verzióját** (`2026-11-09`). | A hozzájárulás így bizonyítható. A verzió az `src/lib/urlap-szerver.ts`-ben frissítendő. |
| U8 | **Ha a CRM nem válaszol** (hiba vagy 8 mp időtúllépés): hibaüzenet jelenik meg telefonszámmal, nincs átirányítás, és nincs konverziómérés. Újrapróbálás vagy sor nincs. | Nem mérünk hamis konverziót. Igény esetén e-mailes tartalék is beköthető. |
| U9 | **Fejlesztői módban `CRM_WEBHOOK_URL` nélkül** csak naplózza az űrlapot. Élesben ilyenkor hibát ad. | A fejlesztés ne akadjon el, de élesben ne vesszen el lead. |
| U10 | **Hostess-fotó: csak link mező** (Instagram vagy fotó linkje). | A brief szerint a feltöltés módja egyeztetendő. |
| U11 | **Életkor:** jelölőnégyzet („Elmúltam {korhatar} éves.”). A korhatár helyőrző. | Nem kérünk születési dátumot (adattakarékosság). |
| U12 | **Kapcsolat-űrlap:** név, e-mail, telefon (nem kötelező), üzenet. A CRM-ben `tipus: kapcsolat`. | A brief „rövid űrlapot” kért. |

## Mérés és sütik

| # | Döntés | Miért |
|---|---|---|
| M1 | **Plausible**, cookie nélkül. Csak akkor töltődik be, ha a `PUBLIC_PLAUSIBLE_DOMAIN` be van állítva. A mérés egy cserélhető `meres()` réteg mögött van. | Nem kell cookie-sáv. GA4-re cserélhető, de akkor sáv is kell. |
| M2 | **Események:** „Ajánlatkérés elküldve”, „Jelentkezés elküldve”, „Kapcsolat-üzenet elküldve” (a köszönőoldalon, újratöltéskor nem duplázódik), valamint „Telefonszám kattintás”, „E-mail kattintás” és „Instagram kattintás”, `hely` tulajdonsággal (hero, fejléc, lábléc…). | A brief eseménylistája. A kapcsolati üzenet külön esemény, hogy az ajánlatkérés száma tiszta maradjon. |
| M3 | **Nincs cookie-sáv.** Az oldal semmit nem tárol a böngészőben (se sütit, se localStorage-ot). | A brief szerint sáv csak nem feltétlenül szükséges süti esetén kell. |

## Tartalom és hangnem

| # | Döntés | Miért |
|---|---|---|
| S1 | **Magázó szöveg mindenhol, kivéve a toborzóoldalt.** A toborzóoldal, a jelentkezés köszönőszövege és a jelentkezési hibaüzenetek tegezők. | Jóváhagyva: fiatal jelentkezőknek szól, az Instagram is ezt a hangot használja. |
| S2 | **A fő üzenet magázva:** „…a pécsi rendezvényén”. | A briefben tegező volt. |
| S3 | **A Dumaszínház és a Hydelight Events nincs megnevezve.** | Ugyanaz a szabály, mint a logóknál: csak engedéllyel. |
| S4 | **Az „Ismerősökkel vagy csapattal?” összevetés** csak a briefben szereplő tényekre épül (bejelentés, számla, eligazítás, pótlás), lekezelő hang nélkül. | A fő versenytárs a „saját ismerős”. |
| S5 | **A „Mi van az árban?” listában** a pótlás így szerepel: „tartalék hostess megszervezése”. Nem állítjuk, hogy díjmentes. | Erről nincs adat. |
| S6 | **A „More than a vibe. It's AURA.” mottó** (az Instagramról) a láblécben és a Rólunk oldalon szerepel, `lang="en"` jelöléssel. | Meglévő saját szlogen, nem kitalált szöveg. |
| S7 | **Az AImpress mint készítő** az Impresszumban szerepel. | Szokásos, visszafogott. Törölhető a `content/hu/jogi/impresszum.md`-ből. |

## Árak

| # | Döntés | Miért |
|---|---|---|
| A1 | **Az árak megjelennek, mellettük sárga helyőrző áll** (jóváhagyás, nettó/bruttó). A keresők csak `jovahagyva: true` után kapnak árat a strukturált adatban. | A brief szerint az árak még jóváhagyásra várnak. |
| A2 | **Számformátum: „5 000 Ft”** (ezres tagolás négy számjegytől). | A brief így írta. |
| A3 | **Az előadóest-csomag 72 000 Ft-ja megjelölve:** listaáron 80 000 Ft lenne (10% kedvezmény?). | Ellentmondás a briefben. A tulajdonos dönt. |
| A4 | **Tájékoztató árkalkulátor** az Árak oldalon (hostessek × órák). JS nélkül a képlet és a példa látszik. | A B2B vásárló gyors becslést akar. Felirata: „Tájékoztató összeg”. |

## Dizájn

| # | Döntés | Miért |
|---|---|---|
| D1 | **Színek:** tinta #0E0D0C, elefántcsont #FAF7F2, homok #F1EBE2, bronz #A97C3F, mély bronz #7A5626 (szöveghez világos háttéren). A bronz a képernyőképről becsült érték. | A végleges kód a logó vektoros fájljából jön. Csere: `src/styles/global.css` → `@theme`. |
| D2 | **Betűk:** Cormorant Garamond 600 (álló és dőlt) és Jost (változtatható vastagságú). Saját tárhelyről töltődnek (Astro Fonts API, `@fontsource` csomagokból), latin + latin-ext, így az ő és ű is megvan. Egyenes számjegyek (a Cormorant alapból régies számokat használ). | A logó betűihez közeli pár. Nincs Google-CDN. A kevesebb betűfájl gyorsabb betöltést ad. |
| D3 | **Aláírás-elem: az „Eligazítás” kártya** a főoldali hero-ban. Az írásos eligazítás öt pontja egymás után kap pipát (csökkentett mozgás beállításnál animáció nélkül). A Rólunk oldalon ugyanez adatlapként jelenik meg. | A cég fő megkülönböztetője, a „pontos feladatlista”, így tárgyként jelenik meg, nem csak szövegként. |
| D4 | **A logó ideiglenesen betűkből áll.** A favicon és az OG-kép is ideiglenes (`npm run og`). | A logó vektoros fájlja hiányzik. |
| D5 | **Fotók helyett jelölt helyőrzők.** A valódi kép a `content/fotok/` mappába kerül. Alt-szöveg nélkül a build leáll. | A brief tiltja a stockfotót. Az alt-szöveg az akadálymentesség miatt kötelező. |
| D6 | **Mobilon gyorssáv** (Hívás / Ajánlatot kérek). Elrejtőzik, amíg egy űrlap látszik, és nyitott menünél is. A jelentkezési és a köszönőoldalon nincs. | Konverzió mobilon, de nem takarja el az űrlapot. |

## SEO

| # | Döntés | Miért |
|---|---|---|
| E1 | **Kulcsszavak oldalanként egy gazdaoldalhoz rendelve.** Hostess Pécs / ügynökség → főoldal. Rendezvény és konferencia → aloldal. Beléptető és jegyszedő → Előadóestek. Hostess bérlés → Árak. Hostess munka → Jelentkezés. | Az oldalak ne versenyezzenek egymással a keresőben. |
| E2 | **LocalBusiness** utcanév nélkül, amíg nincs cím. Szolgáltatási terület: Pécs és Baranya vármegye. A `sameAs` mezőben az Instagram és később a Google Cégprofil. | A brief szerint a cím még hiányzik. |
| E3 | **FAQPage**-adatban csak a helyőrző nélküli válaszok szerepelnek. | A keresők ne kapjanak helyőrzőt. A Google 2023 óta szinte csak hatósági oldalaknál mutat GYIK-találatot. |
| E4 | **Service** (rendezvény-hostess, előadóest-csomag) és **BreadcrumbList** minden aloldalon. | Strukturált adat a helyi kereséshez. |
| E5 | **A sitemap** nem tartalmazza a `/koszonjuk/` és a 404 oldalt. A robots.txt Netlify-előnézeten vagy `ROBOTS_NOINDEX=1` mellett mindent tilt. | A teszt-URL-ek ne kerüljenek indexbe. |

## Minőség és élesítés

| # | Döntés | Miért |
|---|---|---|
| Q1 | **Élesítési zár** (`npm run build:eles`, a Netlify éles telepítése ezt használja). Leáll, ha maradt `[[HIÁNYZIK]]`, ha az árak nincsenek jóváhagyva, ha nincs `SITE_URL`, vagy ha egy jogi oldal még vázlat. | Nem kerülhet élesbe helyőrzős oldal. Az előnézeti telepítések továbbra is működnek. |
| Q2 | **Teljesítmény:** a CSS beágyazva, minden betűfájl előre töltve, a hajtás alatti szekciók `content-visibility: auto` beállítással. Az űrlapos szekciók és a lábléc kivételek, mert ott a mérőeszközök hamis kontraszthibát jeleztek. | Lighthouse mobilon stabilan 95–100. |
| Q3 | **A CRM-hez, a Netlify-hoz és a Plausible-höz nem nyúltam élesben.** A tesztek helyi teszt-webhookon futottak. | Ezek az AImpress fiókjai. |
