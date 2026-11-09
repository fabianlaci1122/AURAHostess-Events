/**
 * Űrlapok a böngészőben: két lépés, magyar hibaüzenetek, UTM, küldés fetch-csel.
 * JS nélkül az űrlap sima POST-tal működik tovább (a szerver ugyanígy ellenőriz).
 */
import {
  SZABALYOK,
  UTM_KULCSOK,
  budapestiMa,
  ellenorizMezo,
  type Fajta,
  type HibaKulcs,
} from '../lib/urlap-szabalyok';

type Uzenetek = Record<string, string>;

function inditas(urlap: HTMLFormElement) {
  const fajta = urlap.dataset.urlap as Fajta;
  const szabalyok = SZABALYOK[fajta];
  const uzenetek: Uzenetek = JSON.parse(urlap.querySelector('script[data-uzenetek]')?.textContent ?? '{}');
  const osszegzo = urlap.querySelector<HTMLElement>('[data-osszegzo]');
  const kuldoGomb = urlap.querySelector<HTMLButtonElement>('button[type="submit"]');
  const kuldoSzoveg = kuldoGomb?.textContent ?? '';
  let probalt = false;

  urlap.noValidate = true;

  // Rejtett mezők: kezdési idő (spamszűrés), oldal, UTM
  const rejtett = (nev: string, ertek: string) => {
    const mezo = urlap.querySelector<HTMLInputElement>(`input[type="hidden"][name="${nev}"]`);
    if (mezo) mezo.value = ertek;
  };
  rejtett('_t', String(Date.now()));
  rejtett('oldal', location.pathname);
  const parameterek = new URLSearchParams(location.search);
  UTM_KULCSOK.forEach((k) => rejtett(k, (parameterek.get(k) ?? '').slice(0, 200)));

  const ertek = (nev: string): string | string[] => {
    const elemek = urlap.querySelectorAll<HTMLInputElement>(`[name="${nev}"]`);
    if (elemek.length === 0) return '';
    const elso = elemek[0];
    if (elso.type === 'checkbox' && szabalyok[nev]?.tipus === 'tobbes') {
      return [...elemek].filter((e) => e.checked).map((e) => e.value);
    }
    if (elso.type === 'checkbox') return elso.checked ? elso.value : '';
    if (elso.type === 'radio') return [...elemek].find((e) => e.checked)?.value ?? '';
    return elso.value;
  };

  const mezoDoboz = (nev: string) => urlap.querySelector<HTMLElement>(`[data-mezo="${nev}"]`);

  const hibatMutat = (nev: string, kulcs: HibaKulcs | null) => {
    const doboz = mezoDoboz(nev);
    if (!doboz) return;
    const hibaElem = doboz.querySelector<HTMLElement>('[data-hiba]');
    const szoveg = kulcs ? (uzenetek[kulcs] ?? uzenetek.kotelezo ?? '') : '';
    if (hibaElem) hibaElem.textContent = szoveg;
    if (doboz.matches('fieldset')) {
      // Választócsoport: a radiogroup kaphat aria-invalidot, a sima csoport csak jelölést.
      doboz.dataset.hibas = String(!!kulcs);
      if (doboz.getAttribute('role') === 'radiogroup') {
        if (kulcs) doboz.setAttribute('aria-invalid', 'true');
        else doboz.removeAttribute('aria-invalid');
      }
      return;
    }
    doboz.querySelectorAll<HTMLElement>('input, textarea, select').forEach((c) =>
      kulcs ? c.setAttribute('aria-invalid', 'true') : c.removeAttribute('aria-invalid'),
    );
  };

  const ellenoriz = (nevek: string[]) => {
    const hibak: [string, HibaKulcs][] = [];
    for (const nev of nevek) {
      const szabaly = szabalyok[nev];
      if (!szabaly) continue;
      const k = ellenorizMezo(szabaly, ertek(nev));
      hibatMutat(nev, k);
      if (k) hibak.push([nev, k]);
    }
    return hibak;
  };

  const elsoHibaraFokusz = (nev: string) => {
    const doboz = mezoDoboz(nev);
    const cel = doboz?.querySelector<HTMLElement>('input, textarea, select');
    cel?.focus();
  };

  // Mezőnként, elhagyáskor (csak az első küldési kísérlet után, hogy ne zavarjon gépelés közben)
  urlap.addEventListener('focusout', (e) => {
    if (!probalt) return;
    const nev = (e.target as HTMLInputElement).name;
    if (nev && szabalyok[nev]) ellenoriz([nev]);
  });
  urlap.addEventListener('change', (e) => {
    const nev = (e.target as HTMLInputElement).name;
    if (probalt && nev && szabalyok[nev]) ellenoriz([nev]);
  });

  // ── Két lépés (ajánlatkérő) ───────────────────────────────
  const lepes1 = [...urlap.querySelectorAll<HTMLElement>('[data-lepes="1"]')];
  const lepes2 = [...urlap.querySelectorAll<HTMLElement>('[data-lepes="2"]')];
  const jelzo = urlap.querySelector<HTMLElement>('[data-lepes-jelzo]');
  const jelzoSzoveg = urlap.querySelector<HTMLElement>('[data-lepes-szoveg]');
  const tovabb = urlap.querySelector<HTMLButtonElement>('[data-tovabb]');
  const vissza = urlap.querySelector<HTMLButtonElement>('[data-vissza]');
  const ketlepeses = lepes1.length > 0 && lepes2.length > 0 && !!tovabb;
  const lepes1Nevek = [...new Set(lepes1.flatMap((l) => [...l.querySelectorAll<HTMLInputElement>('[name]')].map((m) => m.name)))];
  let aktualis = 1;

  const lepesre = (n: 1 | 2, fokusz = true) => {
    aktualis = n;
    lepes1.forEach((l) => (l.hidden = n !== 1));
    lepes2.forEach((l) => (l.hidden = n !== 2));
    if (tovabb) tovabb.hidden = n !== 1;
    if (jelzo) {
      jelzo.hidden = false;
      jelzo.style.setProperty('--keszultseg', n === 1 ? '50%' : '100%');
    }
    if (jelzoSzoveg) jelzoSzoveg.textContent = (n === 1 ? jelzoSzoveg.dataset.egy : jelzoSzoveg.dataset.ketto) ?? '';
    if (fokusz) urlap.querySelector<HTMLElement>(`[data-lepes-cim="${n}"]`)?.focus();
  };

  // A dátum nem lehet a múltban (a böngésző dátumválasztójában is)
  urlap.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach((d) => (d.min = budapestiMa()));

  if (ketlepeses) {
    if (vissza) vissza.hidden = false;
    lepesre(1, false);
    tovabb!.addEventListener('click', () => {
      probalt = true;
      const hibak = ellenoriz(lepes1Nevek);
      if (hibak.length > 0) {
        if (osszegzo) osszegzo.textContent = uzenetek.osszegzo ?? '';
        elsoHibaraFokusz(hibak[0][0]);
        return;
      }
      if (osszegzo) osszegzo.textContent = '';
      lepesre(2);
    });
    vissza?.addEventListener('click', () => lepesre(1));
  }

  // ── Küldés ────────────────────────────────────────────────
  urlap.addEventListener('submit', async (e) => {
    e.preventDefault();
    probalt = true;
    const hibak = ellenoriz(Object.keys(szabalyok));
    if (hibak.length > 0) {
      if (osszegzo) osszegzo.textContent = uzenetek.osszegzo ?? '';
      if (ketlepeses && hibak.some(([nev]) => lepes1Nevek.includes(nev)) && aktualis === 2) lepesre(1, false);
      elsoHibaraFokusz(hibak.find(([nev]) => !ketlepeses || aktualis === 2 || lepes1Nevek.includes(nev))?.[0] ?? hibak[0][0]);
      return;
    }
    if (osszegzo) osszegzo.textContent = '';
    rejtett('kuldes_ideje', new Date().toISOString());

    if (kuldoGomb) {
      kuldoGomb.disabled = true;
      kuldoGomb.textContent = kuldoGomb.dataset.folyamatban ?? kuldoSzoveg;
    }
    urlap.setAttribute('aria-busy', 'true');

    try {
      const valasz = await fetch(urlap.action, {
        method: 'POST',
        body: new FormData(urlap),
        headers: { Accept: 'application/json' },
      });
      const adat = await valasz.json().catch(() => null);
      if (valasz.ok && adat?.ok && typeof adat.atiranyitas === 'string') {
        location.assign(adat.atiranyitas);
        return;
      }
      if (valasz.status === 422 && adat?.hibak) {
        const szerverHibak = Object.entries(adat.hibak as Record<string, HibaKulcs>);
        szerverHibak.forEach(([nev, k]) => hibatMutat(nev, k));
        if (osszegzo) osszegzo.textContent = uzenetek.osszegzo ?? '';
        if (ketlepeses && szerverHibak.some(([nev]) => lepes1Nevek.includes(nev))) lepesre(1, false);
        if (szerverHibak[0]) elsoHibaraFokusz(szerverHibak[0][0]);
      } else if (osszegzo) {
        osszegzo.textContent = uzenetek.szerverhiba ?? '';
        osszegzo.focus();
      }
    } catch {
      if (osszegzo) {
        osszegzo.textContent = uzenetek.szerverhiba ?? '';
        osszegzo.focus();
      }
    }
    if (kuldoGomb) {
      kuldoGomb.disabled = false;
      kuldoGomb.textContent = kuldoSzoveg;
    }
    urlap.removeAttribute('aria-busy');
  });
}

document.querySelectorAll<HTMLFormElement>('form[data-urlap]').forEach(inditas);
