/** Tartalom betöltése a content/<nyelv>/ mappából, érthető hibaüzenetekkel. */
import { getEntry, getCollection, type CollectionEntry } from 'astro:content';
import type { Nyelv, OldalKulcs } from '../i18n/utak';
import { forint, szam, type Tokenek } from './szoveg';

export type Ceg = CollectionEntry<'ceg'>['data'];
export type Felulet = CollectionEntry<'felulet'>['data'];
export type Arazas = CollectionEntry<'arazas'>['data'];
export type Oldal = CollectionEntry<'oldalak'>['data'];
export type Szekcio = Oldal['szekciok'][string];
export type Kerdes = CollectionEntry<'gyik'>['data']['kerdesek'][number];
export type Esettanulmany = CollectionEntry<'referenciak'>['data']['esettanulmanyok'][number];

function hianyzoFajl(fajl: string): never {
  throw new Error(`Hiányzó tartalomfájl: content/${fajl}`);
}

export async function ceg(lang: Nyelv): Promise<Ceg> {
  return (await getEntry('ceg', `${lang}/ceg`))?.data ?? hianyzoFajl(`${lang}/ceg.yaml`);
}

export async function felulet(lang: Nyelv): Promise<Felulet> {
  return (await getEntry('felulet', `${lang}/felulet`))?.data ?? hianyzoFajl(`${lang}/felulet.yaml`);
}

export async function arazas(lang: Nyelv): Promise<Arazas> {
  return (await getEntry('arazas', `${lang}/arazas`))?.data ?? hianyzoFajl(`${lang}/arazas.yaml`);
}

export async function oldal(lang: Nyelv, kulcs: OldalKulcs): Promise<Oldal> {
  return (await getEntry('oldalak', `${lang}/oldalak/${kulcs}`))?.data ?? hianyzoFajl(`${lang}/oldalak/${kulcs}.yaml`);
}

/** Egy szekció az oldal YAML-jéből – ha hiányzik, megmondja, melyik fájlba kell. */
export function szekcio(o: Oldal, kulcs: string, lang: Nyelv, oldalKulcs: OldalKulcs): Szekcio {
  const sz = o.szekciok[kulcs];
  if (!sz) throw new Error(`Hiányzik a "${kulcs}" szekció: content/${lang}/oldalak/${oldalKulcs}.yaml`);
  return sz;
}

export async function gyik(lang: Nyelv, oldalKulcs: OldalKulcs): Promise<Kerdes[]> {
  const e = await getEntry('gyik', `${lang}/gyik`);
  return (e?.data.kerdesek ?? []).filter((k) => k.oldalak.includes(oldalKulcs));
}

export async function referenciak(lang: Nyelv, oldalKulcs?: OldalKulcs) {
  const e = await getEntry('referenciak', `${lang}/referenciak`);
  if (!e) hianyzoFajl(`${lang}/referenciak.yaml`);
  const esetek = oldalKulcs
    ? e.data.esettanulmanyok.filter((r) => r.oldalak.includes(oldalKulcs))
    : e.data.esettanulmanyok;
  return { esetek, logok: e.data.logok, logoHelyorzok: e.data.logo_helyorzok };
}

export async function jogi(lang: Nyelv, nev: 'impresszum' | 'adatkezeles') {
  const lista = await getCollection('jogi', (e) => e.id === `${lang}/jogi/${nev}`);
  return lista[0] ?? hianyzoFajl(`${lang}/jogi/${nev}.md`);
}

/** A szövegekben használható {tokenek} értékei. */
export function tokenErtekek(c: Ceg, a: Arazas): Tokenek {
  return {
    nev: c.nev,
    telefon: c.telefon,
    email: c.email,
    instagram_nev: c.instagram_nev,
    varos: c.varos,
    terulet: c.terulet,
    valaszido: c.valaszido,
    tapasztalat: c.tapasztalat,
    max_egyszerre: String(c.max_egyszerre),
    havi_hostess: c.havi_hostess,
    korhatar: c.korhatar,
    oradij: forint(a.oradij),
    kiallasi_dij: forint(a.kiallasi_dij),
    csomag_ar: forint(a.csomag.ar),
    csomag_letszam: szam(a.csomag.letszam),
    csomag_ora: szam(a.csomag.ora),
    afa: a.afa,
    minimum_ora: a.minimum_ora,
    felarak: a.felarak,
    potlas: a.potlas,
    lemondas: a.lemondas,
    fizetes: a.fizetes,
    ev: String(new Date().getFullYear()),
  };
}

/** Minden oldalon kellő alapadatok egyben. */
export async function alap(lang: Nyelv) {
  const [c, f, a] = await Promise.all([ceg(lang), felulet(lang), arazas(lang)]);
  return { ceg: c, felulet: f, arazas: a, tok: tokenErtekek(c, a) };
}
