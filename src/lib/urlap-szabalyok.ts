/**
 * Űrlap-szabályok EGY helyen: a böngésző és a szerver is ezt használja.
 * A hibaüzenetek kulcsok (pl. "kotelezo"); a szövegük a content/<nyelv>/felulet.yaml-ben van.
 */

export type Fajta = 'ajanlatkeres' | 'jelentkezes' | 'kapcsolat';

export type HibaKulcs =
  | 'kotelezo'
  | 'valasszon'
  | 'email'
  | 'telefon'
  | 'datum'
  | 'szam'
  | 'hossz'
  | 'hozzajarulas'
  | 'eletkor'
  | 'ervenytelen';

export interface Szabaly {
  kotelezo?: boolean;
  max?: number;
  tipus?: 'szoveg' | 'email' | 'telefon' | 'datum' | 'szam' | 'jelolo' | 'valasztas' | 'tobbes';
  opciok?: readonly string[];
  min?: number;
  maxSzam?: number;
  /** Ha a kötelező mező üres, ezt a hibakulcsot adja (pl. a hozzájárulásnál). */
  uresHiba?: HibaKulcs;
}

export const RENDEZVENY_TIPUSOK = ['konferencia', 'gala', 'vip_fogadas', 'eloadoest', 'egyeb'] as const;
export const FELADATOK = [
  'regisztracio',
  'vendegfogadas',
  'iranyitas',
  'protokoll',
  'jegyellenorzes',
  'helyre_kiseres',
  'ruhatar',
  'egyeb',
] as const;
export const NAPOK = ['hetfo', 'kedd', 'szerda', 'csutortok', 'pentek', 'szombat', 'vasarnap'] as const;

const nev: Szabaly = { kotelezo: true, max: 100 };
const email: Szabaly = { kotelezo: true, tipus: 'email', max: 200 };
const telefon: Szabaly = { kotelezo: true, tipus: 'telefon', max: 30 };
const hozzajarulas: Szabaly = { kotelezo: true, tipus: 'jelolo', uresHiba: 'hozzajarulas' };

export const SZABALYOK: Record<Fajta, Record<string, Szabaly>> = {
  ajanlatkeres: {
    nev,
    szervezet: { kotelezo: true, max: 150 },
    email,
    telefon,
    datum: { kotelezo: true, tipus: 'datum' },
    helyszin: { kotelezo: true, max: 150 },
    rendezveny_tipusa: { kotelezo: true, tipus: 'valasztas', opciok: RENDEZVENY_TIPUSOK, uresHiba: 'valasszon' },
    letszam: { tipus: 'szam', min: 1, maxSzam: 100 },
    idotartam: { max: 100 },
    feladatok: { tipus: 'tobbes', opciok: FELADATOK },
    oltozet: { max: 200 },
    nyelvi_igeny: { max: 200 },
    megjegyzes: { max: 2000 },
    adatkezeles: hozzajarulas,
  },
  jelentkezes: {
    nev,
    email,
    telefon,
    varos: { kotelezo: true, max: 100 },
    eletkor: { kotelezo: true, tipus: 'jelolo', uresHiba: 'eletkor' },
    nyelvek: { max: 200 },
    napok: { tipus: 'tobbes', opciok: NAPOK },
    tapasztalat: { max: 2000 },
    profil: { max: 300 },
    adatkezeles: hozzajarulas,
  },
  kapcsolat: {
    nev,
    email,
    telefon: { tipus: 'telefon', max: 30 },
    uzenet: { kotelezo: true, max: 2000 },
    adatkezeles: hozzajarulas,
  },
};

const EMAIL_MINTA = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;

export function telefonRendben(v: string): boolean {
  if (!/^[+0-9 ()\-/.]+$/.test(v)) return false;
  const szamjegyek = v.replace(/\D/g, '').length;
  return szamjegyek >= 8 && szamjegyek <= 15;
}

/** A mai nap Budapesten, ÉÉÉÉ-HH-NN formában. */
export function budapestiMa(most = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Budapest' }).format(most);
}

/** Egy mező ellenőrzése. Az érték szöveg, többes választásnál szövegtömb. */
export function ellenorizMezo(szabaly: Szabaly, ertek: string | string[]): HibaKulcs | null {
  if (szabaly.tipus === 'tobbes') {
    const lista = Array.isArray(ertek) ? ertek : ertek ? [ertek] : [];
    if (szabaly.kotelezo && lista.length === 0) return szabaly.uresHiba ?? 'valasszon';
    if (szabaly.opciok && lista.some((v) => !szabaly.opciok!.includes(v))) return 'ervenytelen';
    return null;
  }
  const v = (Array.isArray(ertek) ? (ertek[0] ?? '') : ertek).trim();
  if (v === '') return szabaly.kotelezo ? (szabaly.uresHiba ?? 'kotelezo') : null;
  if (szabaly.max && v.length > szabaly.max) return 'hossz';
  switch (szabaly.tipus) {
    case 'email':
      return EMAIL_MINTA.test(v) ? null : 'email';
    case 'telefon':
      return telefonRendben(v) ? null : 'telefon';
    case 'datum':
      return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && v >= budapestiMa() ? null : 'datum';
    case 'szam': {
      const n = Number(v);
      if (!Number.isInteger(n)) return 'szam';
      if (szabaly.min !== undefined && n < szabaly.min) return 'szam';
      if (szabaly.maxSzam !== undefined && n > szabaly.maxSzam) return 'szam';
      return null;
    }
    case 'valasztas':
      return szabaly.opciok?.includes(v) ? null : (szabaly.uresHiba ?? 'valasszon');
    default:
      return null;
  }
}

export const UTM_KULCSOK = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
