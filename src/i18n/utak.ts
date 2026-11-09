/**
 * Nyelvek és oldal-útvonalak egy helyen.
 * Angol változat: add hozzá az 'en'-t a NYELVEK-hez és minden oldalhoz az angol útvonalat,
 * hozd létre a content/en/ mappát, és az src/pages/en/ alatt a vékony oldalfájlokat
 * (ugyanazokat a nézeteket hívják lang="en"-nel). A hreflang-címkék automatikusan megjelennek.
 */
export const NYELVEK = ['hu'] as const;
export type Nyelv = (typeof NYELVEK)[number];
export const ALAP_NYELV: Nyelv = 'hu';

export const HTML_LANG: Record<Nyelv, string> = { hu: 'hu' };
export const OG_LOCALE: Record<Nyelv, string> = { hu: 'hu_HU' };

export const UTAK = {
  fooldal: { hu: '/' },
  rendezveny: { hu: '/rendezveny-hostess-pecs/' },
  eloadoest: { hu: '/eloadoestek-beleptetes/' },
  arak: { hu: '/arak/' },
  referenciak: { hu: '/referenciak/' },
  rolunk: { hu: '/rolunk/' },
  jelentkezes: { hu: '/hostess-jelentkezes/' },
  kapcsolat: { hu: '/kapcsolat/' },
  impresszum: { hu: '/impresszum/' },
  adatkezeles: { hu: '/adatkezelesi-tajekoztato/' },
  koszonjuk: { hu: '/koszonjuk/' },
  nemtalalhato: { hu: '/404/' },
} as const satisfies Record<string, Record<Nyelv, string>>;

export type OldalKulcs = keyof typeof UTAK;
export const OLDAL_KULCSOK = Object.keys(UTAK) as [OldalKulcs, ...OldalKulcs[]];

export function ut(kulcs: OldalKulcs, lang: Nyelv = ALAP_NYELV): string {
  return UTAK[kulcs][lang];
}

/** Az adott oldal minden nyelvi változata – hreflang-hoz. */
export function nyelviValtozatok(kulcs: OldalKulcs): { lang: Nyelv; ut: string }[] {
  return NYELVEK.map((lang) => ({ lang, ut: UTAK[kulcs][lang] }));
}

/** Az űrlap-végpontok nyelvfüggetlenek; a nyelvet rejtett mező viszi. */
export const API = {
  ajanlatkeres: '/api/ajanlatkeres/',
  jelentkezes: '/api/jelentkezes/',
  kapcsolat: '/api/kapcsolat/',
} as const;
