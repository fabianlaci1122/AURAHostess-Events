/** Strukturált adatok (schema.org JSON-LD). Helyőrzőt soha nem teszünk bele. */
import type { Arazas, Ceg, Kerdes } from './tartalom';
import { hasznalhato, sima, vanHianyzik, type Tokenek } from './szoveg';

type JsonLd = Record<string, unknown>;

const tiszta = <T extends JsonLd>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '')) as T;

export const vallalkozasId = (site: URL) => new URL('/#vallalkozas', site).href;

export function vallalkozas(c: Ceg, site: URL, kep: string): JsonLd {
  return tiszta({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': vallalkozasId(site),
    name: c.nev,
    description: c.leiras,
    url: new URL('/', site).href,
    image: kep,
    telephone: hasznalhato(c.telefon) ? c.telefon : undefined,
    email: hasznalhato(c.email) ? c.email : undefined,
    sameAs: [c.instagram, hasznalhato(c.google_cegprofil) ? c.google_cegprofil : undefined].filter(Boolean),
    address: tiszta({
      '@type': 'PostalAddress',
      streetAddress: hasznalhato(c.cim) ? c.cim : undefined,
      postalCode: hasznalhato(c.iranyitoszam) ? c.iranyitoszam : undefined,
      addressLocality: c.varos,
      addressCountry: 'HU',
    }),
    areaServed: [
      { '@type': 'City', name: 'Pécs' },
      { '@type': 'AdministrativeArea', name: 'Baranya vármegye' },
    ],
  });
}

export function weboldal(c: Ceg, site: URL, lang: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: c.nev,
    url: new URL('/', site).href,
    inLanguage: lang,
    publisher: { '@id': vallalkozasId(site) },
  };
}

export function szolgaltatas(
  opciok: { nev: string; leiras: string; url: string; tipus: string; ar?: number },
  site: URL,
  a: Arazas,
): JsonLd {
  return tiszta({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opciok.nev,
    serviceType: opciok.tipus,
    description: opciok.leiras,
    url: opciok.url,
    provider: { '@id': vallalkozasId(site) },
    areaServed: [
      { '@type': 'City', name: 'Pécs' },
      { '@type': 'AdministrativeArea', name: 'Baranya vármegye' },
    ],
    // Árat csak jóváhagyás után adunk ki a keresőknek.
    offers:
      a.jovahagyva && opciok.ar !== undefined
        ? { '@type': 'Offer', price: opciok.ar, priceCurrency: 'HUF' }
        : undefined,
  });
}

/** GYIK – a még helyőrzős válaszok kimaradnak. */
export function gyikSema(kerdesek: Kerdes[], tok: Tokenek): JsonLd | null {
  const kesz = kerdesek
    .map((k) => ({ q: sima(k.kerdes, tok), a: sima(k.valasz, tok) }))
    .filter((k) => !vanHianyzik(k.q) && !vanHianyzik(k.a));
  if (kesz.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: kesz.map((k) => ({
      '@type': 'Question',
      name: k.q,
      acceptedAnswer: { '@type': 'Answer', text: k.a },
    })),
  };
}

export function morzsaSema(elemek: { nev: string; href: string }[], site: URL): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: elemek.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.nev,
      item: new URL(e.href, site).href,
    })),
  };
}
