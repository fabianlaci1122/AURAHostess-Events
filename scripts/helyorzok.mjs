// Kilistázza az összes [[HIÁNYZIK]] helyőrzőt a tartalomban.
//   npm run helyorzok              → lista
//   node scripts/helyorzok.mjs --szigoru → hibával kilép, ha maradt helyőrző,
//                                  ha az árak nincsenek jóváhagyva, vagy nincs SITE_URL (élesítés előtti zár)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const GYOKER = process.cwd();
const MAPPAK = ['content'];
const MINTA = /\[\[HIÁNYZIK[^\]]*\]\]/g;

function bejar(mappa) {
  return readdirSync(mappa).flatMap((nev) => {
    const ut = join(mappa, nev);
    if (statSync(ut).isDirectory()) return bejar(ut);
    return /\.(ya?ml|md)$/i.test(nev) ? [ut] : [];
  });
}

const talalatok = [];
for (const mappa of MAPPAK) {
  for (const fajl of bejar(join(GYOKER, mappa))) {
    readFileSync(fajl, 'utf8')
      .split(/\r?\n/)
      .forEach((sor, i) => {
        if (sor.trim().startsWith('#')) return; // YAML-megjegyzés
        for (const m of sor.matchAll(MINTA)) talalatok.push({ fajl: relative(GYOKER, fajl), sor: i + 1, szoveg: m[0] });
      });
  }
}

const fajlonkent = Object.groupBy(talalatok, (t) => t.fajl);
for (const [fajl, lista] of Object.entries(fajlonkent)) {
  console.log(`\n${fajl}`);
  for (const t of lista) console.log(`  ${String(t.sor).padStart(4)}: ${t.szoveg}`);
}
console.log(`\nÖsszesen: ${talalatok.length} helyőrző ${Object.keys(fajlonkent).length} fájlban.`);

if (process.argv.includes('--szigoru')) {
  const gondok = [];
  if (talalatok.length > 0) gondok.push(`${talalatok.length} [[HIÁNYZIK]] helyőrző maradt`);
  const arazas = readFileSync(join(GYOKER, 'content/hu/arazas.yaml'), 'utf8');
  if (/^jovahagyva:\s*false/m.test(arazas)) gondok.push('az árak nincsenek jóváhagyva (content/hu/arazas.yaml: jovahagyva: false)');
  if (!process.env.SITE_URL || /example\./.test(process.env.SITE_URL)) gondok.push('nincs beállítva a SITE_URL (a végleges domain)');
  for (const fajl of bejar(join(GYOKER, 'content'))) {
    if (fajl.endsWith('.md') && /^vazlat:\s*true/m.test(readFileSync(fajl, 'utf8')))
      gondok.push(`${relative(GYOKER, fajl)} még vázlat (vazlat: true) – szakember ellenőrzése után állítsd false-ra`);
  }
  if (gondok.length > 0) {
    console.error(`\nÉLESÍTÉS LEÁLLÍTVA:\n - ${gondok.join('\n - ')}\nElőnézethez használd az "npm run build" parancsot.`);
    process.exit(1);
  }
  console.log('\nÉlesítésre kész: nincs helyőrző.');
}
