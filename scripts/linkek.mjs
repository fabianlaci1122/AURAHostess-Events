// Linkellenőrzés a kész build-en (npm run build után):
// minden belső link és horgony (#azonosito) létező oldalra/elemre mutat-e.
// A külső linkeket csak kilistázza.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const DINAMIKUS = ['/koszonjuk/']; // szerveren renderelt oldalak (nincs HTML-fájljuk)

function bejar(mappa) {
  return readdirSync(mappa).flatMap((nev) => {
    const ut = join(mappa, nev);
    if (statSync(ut).isDirectory()) return nev === '_astro' ? [] : bejar(ut);
    return nev.endsWith('.html') ? [ut] : [];
  });
}

const oldalak = bejar(DIST);
const idk = new Map();
const oldalUt = (fajl) => '/' + relative(DIST, fajl).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
for (const f of oldalak) {
  const html = readFileSync(f, 'utf8');
  idk.set(oldalUt(f), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

const hibak = [];
const kulso = new Set();
let belsoDb = 0;
for (const f of oldalak) {
  const html = readFileSync(f, 'utf8');
  const honnan = oldalUt(f);
  for (const [, href] of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    if (/^(mailto:|tel:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      kulso.add(href);
      continue;
    }
    belsoDb++;
    const [utResz, horgony] = href.split('#');
    const cel = utResz === '' ? honnan : utResz.split('?')[0];
    if (DINAMIKUS.includes(cel)) continue;
    const fajl = cel.endsWith('/') ? join(DIST, cel, 'index.html') : join(DIST, cel);
    if (!existsSync(fajl) && !existsSync(fajl + '.html')) {
      hibak.push(`${honnan} → ${href}  (nincs ilyen oldal)`);
      continue;
    }
    if (horgony && !idk.get(cel)?.has(horgony)) hibak.push(`${honnan} → ${href}  (nincs #${horgony} azonosító)`);
  }
}

console.log(`${oldalak.length} oldal, ${belsoDb} belső link ellenőrizve.`);
console.log(`Külső linkek (${kulso.size}):\n  ${[...kulso].join('\n  ')}`);
if (hibak.length) {
  console.error(`\nHIBÁS LINKEK (${hibak.length}):\n  ${hibak.join('\n  ')}`);
  process.exit(1);
}
console.log('\nMinden belső link rendben.');
