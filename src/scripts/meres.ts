/**
 * Látogatottságmérés – szolgáltatófüggetlen réteg.
 * Most Plausible (cookie nélküli); ha nincs beállítva, a hívások csendben elmaradnak.
 * GA4-re cserélésnél csak ezt a függvényt kell átírni (és akkor cookie-sáv is kell).
 */
declare global {
  interface Window {
    plausible?: ((esemeny: string, opciok?: { props?: Record<string, string> }) => void) & { q?: unknown[] };
  }
}

export const ESEMENYEK = {
  ajanlatkeres: 'Ajánlatkérés elküldve',
  jelentkezes: 'Jelentkezés elküldve',
  kapcsolat: 'Kapcsolat-üzenet elküldve',
  telefon: 'Telefonszám kattintás',
  email: 'E-mail kattintás',
  instagram: 'Instagram kattintás',
} as const;

export function meres(esemeny: string, props?: Record<string, string>): void {
  try {
    window.plausible?.(esemeny, props ? { props } : undefined);
  } catch {
    /* a mérés hibája soha nem akaszthatja meg az oldalt */
  }
  if (import.meta.env.DEV) console.debug('[mérés]', esemeny, props ?? '');
}
