/**
 * Űrlap-feldolgozás a szerveren: spamszűrés, ellenőrzés, továbbítás a CRM webhookra.
 * - JS-sel (fetch, Accept: application/json): JSON választ ad.
 * - JS nélkül (sima űrlapküldés): siker esetén 303 → /koszonjuk/, hiba esetén egyszerű HTML-oldal.
 */
import { CRM_WEBHOOK_SECRET, CRM_WEBHOOK_URL } from 'astro:env/server';
import { SZABALYOK, UTM_KULCSOK, ellenorizMezo, type Fajta, type HibaKulcs } from './urlap-szabalyok';
import { escapeHtml } from './szoveg';
import { ut } from '../i18n/utak';

const MIN_KITOLTESI_IDO_MS = 2500;
const WEBHOOK_IDOKORLAT_MS = 8000;
const ADATKEZELESI_VERZIO = '2026-11-09';

const HIBA_SZOVEG: Record<HibaKulcs, string> = {
  kotelezo: 'Kötelező mező.',
  valasszon: 'Válasszon egyet.',
  email: 'Érvénytelen e-mail-cím.',
  telefon: 'Érvénytelen telefonszám.',
  datum: 'Mai vagy későbbi dátumot adjon meg.',
  szam: 'Érvénytelen szám.',
  hossz: 'Túl hosszú szöveg.',
  hozzajarulas: 'Az adatkezelési tájékoztató elfogadása szükséges.',
  eletkor: 'Az életkor megerősítése szükséges.',
  ervenytelen: 'Érvénytelen érték.',
};

const MEZONEVEK: Record<string, string> = {
  nev: 'Név',
  szervezet: 'Szervezet',
  email: 'E-mail-cím',
  telefon: 'Telefonszám',
  datum: 'Dátum',
  helyszin: 'Helyszín',
  rendezveny_tipusa: 'A rendezvény típusa',
  letszam: 'Létszám',
  idotartam: 'Időtartam',
  feladatok: 'Feladatok',
  oltozet: 'Öltözet',
  nyelvi_igeny: 'Nyelvi igény',
  megjegyzes: 'Megjegyzés',
  adatkezeles: 'Adatkezelési hozzájárulás',
  varos: 'Település',
  eletkor: 'Életkor',
  nyelvek: 'Nyelvek',
  napok: 'Elérhető napok',
  tapasztalat: 'Tapasztalat',
  profil: 'Profil vagy fotó',
  uzenet: 'Üzenet',
};

const szoveg = (fd: FormData, nev: string, max = 300) => String(fd.get(nev) ?? '').trim().slice(0, max);

function jsonValasz(adat: unknown, statusz = 200) {
  return new Response(JSON.stringify(adat), {
    status: statusz,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function htmlValasz(cim: string, torzs: string, statusz: number) {
  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(cim)} | AURA.</title>
<style>body{margin:0;font:17px/1.6 system-ui,sans-serif;background:#faf7f2;color:#1c1a17}main{max-width:36rem;margin:0 auto;padding:3rem 1rem}h1{font:600 2rem/1.15 Georgia,serif}a{color:#7a5626}li{margin:.25rem 0}</style></head>
<body><main><h1>${escapeHtml(cim)}</h1>${torzs}</main></body></html>`;
  return new Response(html, { status: statusz, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function visszaUt(fd: FormData): string {
  const oldal = szoveg(fd, 'oldal', 200);
  return oldal.startsWith('/') && !oldal.startsWith('//') ? oldal : '/';
}

async function alairas(torzs: string, titok: string): Promise<string> {
  const kulcs = await crypto.subtle.importKey('raw', new TextEncoder().encode(titok), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', kulcs, new TextEncoder().encode(torzs));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Továbbítás a CRM-nek. true = sikerült. */
async function tovabbit(adat: unknown): Promise<boolean> {
  const torzs = JSON.stringify(adat);
  if (!CRM_WEBHOOK_URL) {
    if (import.meta.env.DEV) {
      console.info('[urlap] CRM_WEBHOOK_URL nincs beállítva – fejlesztői módban csak naplózom:\n' + torzs);
      return true;
    }
    console.error('[urlap] CRM_WEBHOOK_URL nincs beállítva – az űrlap nem továbbítható.');
    return false;
  }
  const fejlecek: Record<string, string> = { 'Content-Type': 'application/json; charset=utf-8' };
  if (CRM_WEBHOOK_SECRET) fejlecek['X-Aura-Signature'] = `sha256=${await alairas(torzs, CRM_WEBHOOK_SECRET)}`;
  try {
    const valasz = await fetch(CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: fejlecek,
      body: torzs,
      signal: AbortSignal.timeout(WEBHOOK_IDOKORLAT_MS),
    });
    if (!valasz.ok) console.error(`[urlap] A CRM webhook hibát adott: HTTP ${valasz.status}`);
    return valasz.ok;
  } catch (hiba) {
    console.error('[urlap] A CRM webhook nem érhető el:', hiba);
    return false;
  }
}

export async function feldolgoz(fajta: Fajta, request: Request): Promise<Response> {
  const kerJson = (request.headers.get('accept') ?? '').includes('application/json');
  const koszonjuk = `${ut('koszonjuk')}?tipus=${fajta}`;
  const siker = () =>
    kerJson ? jsonValasz({ ok: true, atiranyitas: koszonjuk }) : Response.redirect(new URL(koszonjuk, request.url), 303);

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return kerJson ? jsonValasz({ ok: false, hiba: 'formatum' }, 400) : htmlValasz('Hibás kérés', '<p>Az űrlap adatai nem olvashatók.</p>', 400);
  }

  // Spamszűrés: kitöltött csalimező, vagy gyanúsan gyors kitöltés → csendben elnyeljük.
  const csali = szoveg(fd, 'weboldal');
  const kezdes = Number(szoveg(fd, '_t', 20));
  if (csali || (kezdes > 0 && Date.now() - kezdes < MIN_KITOLTESI_IDO_MS)) {
    console.info(`[urlap] spamgyanús beküldés elnyelve (${fajta})`);
    return siker();
  }

  const szabalyok = SZABALYOK[fajta];
  const adatok: Record<string, string | string[] | boolean | number> = {};
  const hibak: Record<string, HibaKulcs> = {};

  for (const [nev, szabaly] of Object.entries(szabalyok)) {
    const ertek =
      szabaly.tipus === 'tobbes'
        ? fd.getAll(nev).map((v) => String(v))
        : String(fd.get(nev) ?? '');
    const hiba = ellenorizMezo(szabaly, ertek);
    if (hiba) {
      hibak[nev] = hiba;
      continue;
    }
    if (szabaly.tipus === 'jelolo') adatok[nev] = ertek === 'igen' || ertek === 'on';
    else if (szabaly.tipus === 'tobbes') adatok[nev] = ertek as string[];
    else if (szabaly.tipus === 'szam') adatok[nev] = ertek === '' ? '' : Number(ertek);
    else adatok[nev] = (ertek as string).trim();
  }

  if (Object.keys(hibak).length > 0) {
    if (kerJson) return jsonValasz({ ok: false, hibak }, 422);
    const lista = Object.entries(hibak)
      .map(([nev, k]) => `<li><strong>${escapeHtml(MEZONEVEK[nev] ?? nev)}:</strong> ${escapeHtml(HIBA_SZOVEG[k])}</li>`)
      .join('');
    return htmlValasz(
      'Néhány mező hiányzik vagy hibás',
      `<ul>${lista}</ul><p><a href="${escapeHtml(visszaUt(fd))}">Vissza az űrlaphoz</a> (a böngésző Vissza gombjával a beírt adatok általában megmaradnak).</p>`,
      400,
    );
  }

  const utm = Object.fromEntries(UTM_KULCSOK.map((k) => [k, szoveg(fd, k, 200)]).filter(([, v]) => v));
  const csomag = {
    tipus: fajta,
    nyelv: szoveg(fd, 'nyelv', 5) || 'hu',
    adatok,
    meta: {
      oldal: visszaUt(fd),
      utm,
      kuldes_ideje_bongeszo: szoveg(fd, 'kuldes_ideje', 40) || null,
      fogadva: new Date().toISOString(),
      adatkezelesi_tajekoztato_verzio: ADATKEZELESI_VERZIO,
    },
  };

  if (!(await tovabbit(csomag))) {
    if (kerJson) return jsonValasz({ ok: false, hiba: 'kuldes' }, 502);
    return htmlValasz(
      'Az elküldés most nem sikerült',
      `<p>Próbálja újra pár perc múlva, vagy keressen minket telefonon vagy Instagramon.</p><p><a href="${escapeHtml(visszaUt(fd))}">Vissza az űrlaphoz</a></p>`,
      502,
    );
  }
  return siker();
}
