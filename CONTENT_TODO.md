# Hiányzó tartalmak – CONTENT_TODO

Az oldalon minden hiányzó adat sárga **`[[HIÁNYZIK: …]]`** jelöléssel látszik. Az **éles build addig leáll**, amíg marad belőlük (lásd README).

- **Aktuális lista fájlonként:** `npm run helyorzok` (2026-11-09-én 70 helyőrző, 11 fájlban).
- **Hogyan:** a megadott adatot a jelzett fájlban írd a helyőrző helyére. A `{kapcsos}` részeket ne töröld.

---

## A tulajdonos (AURA.) adja meg

### Elérhetőség és cégadatok – `content/hu/ceg.yaml`
- [ ] **Telefonszám** (`telefon`) – erre megy minden „Hívjon most” gomb. Addig a gombok a Kapcsolat oldalra visznek.
- [ ] **E-mail-cím** (`email`)
- [ ] **Válaszidő ajánlatkérésre** (`valaszido`), pl. „24 órán belül”. Több helyen szerepel: a lépésekben, az űrlapnál, a záró sávokban és a köszönőoldalon.
- [ ] **Cím** (`cim`, `iranyitoszam`) – vagy üresen hagyni (`""`), ha nem nyilvános. Ilyenkor csak „Pécs” és a szolgáltatási terület látszik.
- [ ] **Korhatár** a hostess-jelentkezéshez (`korhatar`), pl. „18”.
- [ ] **Google Cégprofil link** (`google_cegprofil`) – ha még nincs cégprofil, az AImpress segít létrehozni (lásd lent).

### Árak és működés – `content/hu/arazas.yaml`
- [ ] **Az árak jóváhagyása:** 5 000 Ft/fő/óra és 5 000 Ft/fő/alkalom. Jóváhagyás után: `jovahagyva: true`, és a `jovahagyas_megjegyzes` sor törölhető.
- [ ] **Nettó vagy bruttó?** (`afa`) – az ÁFA-státusztól függ.
- [ ] **Előadóest-csomag ára** (`csomag.ar_megjegyzes`): a 72 000 Ft szándékos kedvezmény? Listaáron 80 000 Ft lenne (4 × 3 × 5 000 + 4 × 5 000). Ha igen, érdemes kiemelni.
- [ ] **Minimális óraszám** alkalmanként (`minimum_ora`)
- [ ] **Felárak** (`felarak`): hétvége, késő este, nyelvtudás, Pécsen kívüli helyszín?
- [ ] **A pótlás menete** (`potlas`): mennyi idő alatt, szólnak-e előre a megrendelőnek?
- [ ] **Lemondási feltételek** (`lemondas`)
- [ ] **Fizetés módja és határideje** (`fizetes`)

### A szolgáltatás részletei
- [ ] **Minimális előfoglalási idő** – `content/hu/gyik.yaml` („Mennyi idővel előre kell szólni?”)
- [ ] **Vállalnak-e Baranyán kívül, van-e utazási költség?** – `gyik.yaml`
- [ ] **Milyen nyelveken tudnak hostesst adni?** – `gyik.yaml`
- [ ] **Van-e saját, egységes öltözet?** – `gyik.yaml`
- [ ] **A keretmegállapodás feltételei** (minimális időtartam vagy estek száma) – `gyik.yaml` és `content/hu/oldalak/eloadoest.yaml` (`keret.megjegyzes`)
- [ ] **Tudnak-e intézményeknek írásos árajánlatot, szerződést, teljesítésigazolást adni?** – `content/hu/oldalak/rendezveny.yaml` (`intezmenyeknek.megjegyzes`)

### Hostess-toborzás – `content/hu/oldalak/jelentkezes.yaml`, `koszonjuk.yaml`
- [ ] **Hostess-órabér vagy bérsáv** – kiírja-e a tulajdonos? (`kapsz.megjegyzes`; ha nem, a sor törölhető)
- [ ] **Mi történik a jelentkezés után?** (`folyamat.szoveg`), pl. visszajelzés ideje, személyes találkozó, próbamunka
- [ ] **Mikor és hogyan jeleznek vissza a jelentkezőknek** – `koszonjuk.yaml` (`jelentkezes.szoveg`)

### Rólunk – `content/hu/oldalak/rolunk.yaml`
- [ ] **A tulajdonos neve** (`tulajdonos.cim`)
- [ ] **A tulajdonos története**, 3–5 mondat: hogyan indult az AURA., miért csinálja (`tulajdonos.szoveg`)
- [ ] **Portréfotó** (lásd Fotók)

### Referenciák – `content/hu/referenciak.yaml`
Három esettanulmány-hely van. Mindegyikhez kell: rendezvény neve, típusa, helyszíne, hány hostess dolgozott, milyen feladatokkal, egy megbízói idézet, az idéző neve és beosztása.
- [ ] **1. esettanulmány** (konferencia jellegű)
- [ ] **2. esettanulmány** (előadóest jellegű)
- [ ] **3. esettanulmány** (gála jellegű)
- [ ] **A megbízók írásos engedélye** a név, az idézet és a logó megjelenítéséhez. Példa megbízók a briefből: Dumaszínház, Hydelight Events, egyetem, önkormányzat.
- [ ] **Megbízói logók** (csak engedéllyel) → `logok:` lista + a fájlok a `content/fotok/` mappába

### Fotók és arculat
- [ ] **A logó vektoros fájlja** (SVG vagy PDF) és **a pontos színkódjai** – a betűs logó, a favicon, az OG-kép és a bronz hangsúlyszín (#A97C3F, becsült érték) cseréjéhez
- [ ] **Saját fotók** a helyőrzők helyére. Mindegyik `FOTÓ: …` doboz megmondja, mi kellene rá:
  - Főoldal: hostess-csapat a regisztrációs pultnál; regisztrációs pult (konferencia); jegyellenőrzés egy előadóest bejáratánál
  - Rendezvény-hostess: vendégfogadás egy gálán; regisztrációs pult; VIP-fogadás; intézményi rendezvény
  - Előadóestek: beléptetés egy előadóest előtt
  - Rólunk: a tulajdonos portréja
  - Jelentkezés: a csapat egy rendezvény előtt
  - Referenciák: egy-egy kép rendezvényenként
- [ ] **A fotókon szereplő hostessek írásos hozzájárulása** a webes megjelenéshez. Az Instagram-képeken felismerhető személyek vannak.

### Jogi adatok – `content/hu/jogi/impresszum.md`, `adatkezeles.md`
- [ ] Az egyéni vállalkozó **teljes neve**
- [ ] **Székhely**
- [ ] **Egyéni vállalkozói nyilvántartási szám**
- [ ] **Adószám**

---

## Az AImpress adja meg vagy intézi

### Beállítások (Netlify környezeti változók)
- [ ] **Végleges domain** → `SITE_URL` (canonical, sitemap, OG)
- [ ] **CRM webhook** → `CRM_WEBHOOK_URL`, opcionálisan `CRM_WEBHOOK_SECRET`. Ellenőrizni kell, hogy a CRM fogadja-e a README-ben leírt JSON-formátumot.
- [ ] **Plausible-fiók** és a domain felvétele → `PUBLIC_PLAUSIBLE_DOMAIN`. A README-ben felsorolt események célként (Goal) felvéve.
- [ ] **Netlify-oldal** létrehozása, a domain bekötése

### Jogi szövegek (jogász bevonásával)
- [ ] **Tárhelyszolgáltató** neve, címe, elérhetősége – `impresszum.md` és `adatkezeles.md`
- [ ] **Az AImpress mint adatfeldolgozó** (CRM, e-mail-küldés): pontos cégadatok és adatfeldolgozói szerződés – `adatkezeles.md`
- [ ] **A mérőeszköz** neve és szolgáltatója – `adatkezeles.md`
- [ ] **Jogalapok ellenőrzése:** ajánlatkérés, kapcsolat, a megkeresés forrása (érdekmérlegelési teszt)
- [ ] **Megőrzési idők** (ajánlatkérés, jelentkezés, üzenet)
- [ ] **Válaszhatáridő** az érintetti kérelmekre, és a **NAIH aktuális elérhetősége**
- [ ] A szakember jóváhagyása után: `vazlat: false` az `adatkezeles.md` fejlécében. Az éles build addig leáll.
- [ ] Ha a tájékoztató szövege változik: az új verziódátum az `src/lib/urlap-szerver.ts` fájlban (`ADATKEZELESI_VERZIO`) és a `frissitve:` mezőben

### Helyi keresés és arculat
- [ ] **Google Cégprofil** létrehozása vagy ellenőrzése a tulajdonossal: név, kategória, szolgáltatási terület Pécs és Baranya. Utána a link a `ceg.yaml`-be.
- [ ] **Végleges OG-kép** (1200×630) és **favicon** a logóból → `public/og/aura-alap.png`, `public/favicon.svg`. Az `npm run og` csak ideiglenes képet készít.
- [ ] **A fotók feltöltése** a `content/fotok/` mappába, `alt`-szöveggel (lásd README)

### Utolsó lépés élesítés előtt
- [ ] `npm run build:eles` hiba nélkül lefut
- [ ] Tesztbeküldés mindhárom űrlappal az éles CRM-be, és a visszaigazoló e-mailek megérkeznek
- [ ] Lighthouse mobilon az éles domainen
