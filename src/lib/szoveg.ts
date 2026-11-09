/** Szövegsegédek: {token} csere, [[HIÁNYZIK]] jelölés, **félkövér**, számformázás. */

export type Tokenek = Record<string, string>;

const HIANYZIK = /\[\[HIÁNYZIK[^\]]*\]\]/g;

export const vanHianyzik = (s?: string | null): boolean => !!s && s.includes('[[HIÁNYZIK');

/** Kitöltött, valódi érték? (nem üres és nem helyőrző) */
export const hasznalhato = (s?: string | null): s is string => !!s && s.trim() !== '' && !vanHianyzik(s);

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * {kulcs} → érték. A nagy kezdőbetűs változat ({Valaszido}) a mondat elejére való:
 * az érték első betűje nagy lesz.
 */
export function tokenek(s: string, ertekek: Tokenek = {}): string {
  return s.replace(/\{([A-Za-z_]+)\}/g, (eredeti, kulcs: string) => {
    if (kulcs in ertekek) return ertekek[kulcs];
    const kicsi = kulcs.charAt(0).toLowerCase() + kulcs.slice(1);
    if (kicsi !== kulcs && kicsi in ertekek) {
      const v = ertekek[kicsi];
      return v.startsWith('[[') ? v : v.charAt(0).toUpperCase() + v.slice(1);
    }
    return eredeti;
  });
}

/** Biztonságos HTML egy sorhoz: tokenek, escape, **félkövér**, sárga helyőrző. */
export function inline(s: string | undefined | null, ertekek: Tokenek = {}): string {
  if (!s) return '';
  let t = escapeHtml(tokenek(s, ertekek));
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(HIANYZIK, (m) => `<mark class="hianyzik">${m}</mark>`);
  return t;
}

/** Sima szöveg (meta, aria, JSON-LD): tokenek, jelölés nélkül. */
export function sima(s: string | undefined | null, ertekek: Tokenek = {}): string {
  if (!s) return '';
  return tokenek(s, ertekek).replace(/\*\*(.+?)\*\*/g, '$1');
}

/**
 * Kész HTML-ben (renderelt Markdown) sárgára jelöli a [[HIÁNYZIK]] részeket,
 * majd cseréli a {tokeneket} (azok saját helyőrzőit az inline() jelöli).
 */
export function tokenekHtml(html: string, ertekek: Tokenek): string {
  return html
    .replace(HIANYZIK, (m) => `<mark class="hianyzik">${m}</mark>`)
    .replace(/\{([A-Za-z_]+)\}/g, (eredeti, kulcs: string) => (kulcs in ertekek ? inline(ertekek[kulcs]) : eredeti));
}

const szamFormatum = new Intl.NumberFormat('hu-HU', { useGrouping: 'always' });
export const szam = (n: number): string => szamFormatum.format(n);
export const forint = (n: number): string => `${szam(n)} Ft`;

/** tel: link. Amíg a szám helyőrző, a Kapcsolat oldalra visz, hogy ne legyen halott link. */
export function telHref(telefon: string, tartalek = '/kapcsolat/'): string {
  if (!hasznalhato(telefon)) return tartalek;
  return `tel:${telefon.replace(/[^\d+]/g, '')}`;
}

export function mailHref(email: string, tartalek = '/kapcsolat/'): string {
  if (!hasznalhato(email)) return tartalek;
  return `mailto:${email.trim()}`;
}
