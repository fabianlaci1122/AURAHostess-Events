/**
 * Minden oldalon fut: mobilmenü, kattintásmérés, UTM-paraméterek továbbvitele,
 * a mobil gyorssáv elrejtése az űrlapoknál.
 * Semmit nem tárol a böngészőben (se süti, se localStorage) – ezért nem kell cookie-sáv.
 */
import { ESEMENYEK, meres } from './meres';
import { UTM_KULCSOK } from '../lib/urlap-szabalyok';

// ── Mobilmenü ───────────────────────────────────────────────
const gomb = document.querySelector<HTMLButtonElement>('[data-menu-gomb]');
const menu = document.getElementById('mobil-menu');
if (gomb && menu) {
  const sr = gomb.querySelector('[data-menu-sr]');
  const allit = (nyitva: boolean) => {
    gomb.setAttribute('aria-expanded', String(nyitva));
    menu.hidden = !nyitva;
    gomb.querySelector('.menu-ikon-nyit')?.classList.toggle('hidden', nyitva);
    gomb.querySelector('.menu-ikon-zar')?.classList.toggle('hidden', !nyitva);
    if (sr) sr.textContent = (nyitva ? gomb.dataset.zaras : gomb.dataset.nyitas) ?? '';
    document.documentElement.style.overflow = nyitva ? 'hidden' : '';
    document.documentElement.toggleAttribute('data-menu-nyitva', nyitva);
  };
  gomb.addEventListener('click', () => allit(gomb.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gomb.getAttribute('aria-expanded') === 'true') {
      allit(false);
      gomb.focus();
    }
  });
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) allit(false);
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && allit(false));
}

// ── Kattintásmérés: telefon, e-mail, Instagram ──────────────
document.addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest?.('a');
  if (!a) return;
  const href = a.getAttribute('href') ?? '';
  const hely = (a as HTMLElement).dataset.hely ?? 'egyeb';
  if (href.startsWith('tel:')) meres(ESEMENYEK.telefon, { hely });
  else if (href.startsWith('mailto:')) meres(ESEMENYEK.email, { hely });
  else if (/(^|\.)instagram\.com/.test(a.hostname)) meres(ESEMENYEK.instagram, { hely });
});

// ── UTM továbbvitele a belső linkekre (tárolás nélkül) ──────
const utm = new URLSearchParams();
const most = new URLSearchParams(location.search);
for (const k of UTM_KULCSOK) {
  const v = most.get(k);
  if (v) utm.set(k, v.slice(0, 200));
}
if ([...utm.keys()].length > 0) {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
    if (a.getAttribute('href')?.startsWith('//')) return;
    const url = new URL(a.href);
    if (url.pathname.startsWith('/api/')) return;
    utm.forEach((v, k) => url.searchParams.set(k, v));
    a.href = url.pathname + url.search + url.hash;
  });
}

// ── A mobil gyorssáv eltűnik, amíg egy űrlap látszik ────────
const sav = document.querySelector<HTMLElement>('[data-mobil-sav]');
const urlapok = document.querySelectorAll('form[data-urlap]');
if (sav && urlapok.length > 0 && 'IntersectionObserver' in window) {
  const lathato = new Set<Element>();
  const megfigyelo = new IntersectionObserver((bejegyzesek) => {
    bejegyzesek.forEach((b) => (b.isIntersecting ? lathato.add(b.target) : lathato.delete(b.target)));
    sav.dataset.rejtett = String(lathato.size > 0);
  });
  urlapok.forEach((u) => megfigyelo.observe(u));
}
