/**
 * A content/ mappa sémái. Ha egy tartalomfájlból kötelező mező hiányzik vagy rossz típusú,
 * a build érthető hibaüzenettel áll meg (melyik fájl, melyik mező).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { OLDAL_KULCSOK } from './i18n/utak';

const azonosito = ({ entry }: { entry: string }) => entry.replace(/\.(ya?ml|md)$/i, '');
const betolto = (minta: string) => glob({ pattern: minta, base: './content', generateId: azonosito });

const oldalKulcs = z.enum(OLDAL_KULCSOK);

const foto = z.object({
  leiras: z.string(),
  fajl: z.string().optional(),
  alt: z.string().optional(),
});

const elem = z.object({
  cim: z.string(),
  szoveg: z.string().optional(),
  ikon: z.string().optional(),
  foto: foto.optional(),
  oldal: oldalKulcs.optional(),
  link_szoveg: z.string().optional(),
  pontok: z.array(z.string()).optional(),
});

const szekcio = z.object({
  cimke: z.string().optional(),
  cim: z.string().optional(),
  bevezeto: z.string().optional(),
  szoveg: z.string().optional(),
  megjegyzes: z.string().optional(),
  gomb: z.string().optional(),
  link_szoveg: z.string().optional(),
  elemek: z.array(elem).optional(),
  pontok: z.array(z.string()).optional(),
  foto: foto.optional(),
  sorok: z.array(z.object({ szempont: z.string(), ismeros: z.string(), aura: z.string() })).optional(),
  oszlop_szempont: z.string().optional(),
  oszlop_ismeros: z.string().optional(),
  oszlop_aura: z.string().optional(),
});

const oldalak = defineCollection({
  loader: betolto('*/oldalak/*.yaml'),
  schema: z.object({
    seo: z.object({
      title: z.string().max(70, 'A title legfeljebb 70 karakter legyen (a Google levágja).'),
      description: z.string().max(170, 'A description legfeljebb 170 karakter legyen.'),
      noindex: z.boolean().default(false),
    }),
    hero: z.object({
      cimke: z.string().optional(),
      cim: z.string(),
      alcim: z.string().optional(),
      bizalmi: z.array(z.string()).optional(),
      foto: foto.optional(),
      eligazitas: z
        .object({
          cim: z.string(),
          alcim: z.string(),
          sorok: z.array(z.object({ cim: z.string(), szoveg: z.string() })),
        })
        .optional(),
    }),
    szekciok: z.record(z.string(), szekcio).default({}),
  }),
});

const ceg = defineCollection({
  loader: betolto('*/ceg.yaml'),
  schema: z.object({
    nev: z.string(),
    rovid_nev: z.string(),
    motto: z.string(),
    leiras: z.string(),
    telefon: z.string(),
    email: z.string(),
    instagram: z.string(),
    instagram_nev: z.string(),
    google_cegprofil: z.string(),
    varos: z.string(),
    iranyitoszam: z.string(),
    cim: z.string(),
    terulet: z.string(),
    valaszido: z.string(),
    tapasztalat: z.string(),
    max_egyszerre: z.number().int().positive(),
    havi_hostess: z.string(),
    korhatar: z.string(),
  }),
});

const arazas = defineCollection({
  loader: betolto('*/arazas.yaml'),
  schema: z.object({
    jovahagyva: z.boolean(),
    jovahagyas_megjegyzes: z.string(),
    afa: z.string(),
    oradij: z.number().int().nonnegative(),
    kiallasi_dij: z.number().int().nonnegative(),
    minimum_ora: z.string(),
    felarak: z.string(),
    pelda: z.object({ letszam: z.number().int().positive(), ora: z.number().positive() }),
    kalkulator: z.object({ max_letszam: z.number().int().positive(), max_ora: z.number().positive() }),
    csomag: z.object({
      nev: z.string(),
      letszam: z.number().int().positive(),
      ora: z.number().positive(),
      ar: z.number().int().nonnegative(),
      ar_megjegyzes: z.string(),
      feladatok: z.array(z.string()),
    }),
    potlas: z.string(),
    lemondas: z.string(),
    fizetes: z.string(),
  }),
});

const gyik = defineCollection({
  loader: betolto('*/gyik.yaml'),
  schema: z.object({
    kerdesek: z.array(z.object({ kerdes: z.string(), valasz: z.string(), oldalak: z.array(oldalKulcs) })),
  }),
});

const referenciak = defineCollection({
  loader: betolto('*/referenciak.yaml'),
  schema: z.object({
    esettanulmanyok: z.array(
      z.object({
        rendezveny: z.string(),
        tipus: z.string(),
        helyszin: z.string(),
        letszam: z.string(),
        feladat: z.string(),
        idezet: z.string(),
        idezo: z.string(),
        foto: foto.optional(),
        oldalak: z.array(oldalKulcs),
      }),
    ),
    logok: z.array(z.object({ nev: z.string(), fajl: z.string().optional() })).default([]),
    logo_helyorzok: z.number().int().nonnegative().default(5),
  }),
});

const mezo = z.object({ cimke: z.string(), sugo: z.string().optional() });
const opcio = z.object({ ertek: z.string(), szoveg: z.string() });
const uzenetek = z.record(z.string(), z.string());

const felulet = defineCollection({
  loader: betolto('*/felulet.yaml'),
  schema: z.object({
    ugras_tartalomra: z.string(),
    menu: z.object({
      cimke: z.string(),
      nyitas: z.string(),
      nyitas_sr: z.string(),
      zaras_sr: z.string(),
      pontok: z.array(z.object({ oldal: oldalKulcs, szoveg: z.string() })),
      jelentkezes: z.string(),
    }),
    gombok: z.object({
      ajanlat: z.string(),
      hivas: z.string(),
      hivas_rovid: z.string(),
      jelentkezes: z.string(),
      csomag: z.string(),
    }),
    morzsa: z.object({ cimke: z.string(), fooldal: z.string() }),
    mobil_sav: z.string(),
    foto_helyorzo: z.string(),
    lablec: z.object({
      leiras: z.string(),
      szolgaltatasok: z.string(),
      ceg: z.string(),
      elerhetoseg: z.string(),
      terulet: z.string(),
      cegprofil: z.string(),
      jogi: z.string(),
      jog: z.string(),
    }),
    ajanlat_szekcio: z.object({
      cimke: z.string(),
      cim: z.string(),
      bevezeto: z.string(),
      utana_cim: z.string(),
      utana: z.array(z.string()),
      kozvetlen_cim: z.string(),
      telefon: z.string(),
      email: z.string(),
    }),
    urlap: z.object({
      nem_kotelezo: z.string(),
      adatkezeles_elotte: z.string(),
      adatkezeles_link: z.string(),
      adatkezeles_utana: z.string(),
      uj_lapon: z.string(),
      kuldes_folyamatban: z.string(),
      lepes_jelzo: z.string(),
      lepes1: z.string(),
      lepes2: z.string(),
      lepes2_sugo: z.string(),
      tovabb: z.string(),
      vissza: z.string(),
      uzenetek: z.object({ magazo: uzenetek, tegezo: uzenetek }),
      ajanlat: z.object({
        kuldes: z.string(),
        mezok: z.record(z.string(), mezo),
        tipusok: z.array(opcio),
        feladatok: z.array(opcio),
      }),
      jelentkezes: z.object({
        kuldes: z.string(),
        mezok: z.record(z.string(), mezo),
        napok: z.array(opcio),
      }),
      kapcsolat: z.object({
        kuldes: z.string(),
        mezok: z.record(z.string(), mezo),
      }),
    }),
    kalkulator: z.object({
      cim: z.string(),
      letszam: z.string(),
      ora: z.string(),
      oradij_resz: z.string(),
      kiallasi_resz: z.string(),
      osszesen: z.string(),
      megjegyzes: z.string(),
    }),
  }),
});

const jogi = defineCollection({
  loader: betolto('*/jogi/*.md'),
  schema: z.object({
    title: z.string().max(70),
    cim: z.string(),
    description: z.string().max(170),
    frissitve: z.string(),
    vazlat: z.boolean().default(false),
    vazlat_megjegyzes: z.string().optional(),
  }),
});

export const collections = { oldalak, ceg, arazas, gyik, referenciak, felulet, jogi };
