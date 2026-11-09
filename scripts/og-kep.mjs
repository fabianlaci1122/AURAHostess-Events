// Ideiglenes megosztási kép (1200×630) és ikonok generálása a public/ mappába.
// Futtatás: npm run og   – a végleges változat a logó vektoros fájljából készüljön.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0e0d0c"/>
  <path d="M-40 520C220 470 470 360 720 230 900 140 1060 90 1240 110" fill="none" stroke="#a97c3f" stroke-width="2" opacity=".55"/>
  <path d="M80 600c240-60 480-170 720-330" fill="none" stroke="#a97c3f" stroke-width="1" opacity=".35"/>
  <text x="96" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="150" font-weight="600" fill="#faf7f2" letter-spacing="6">AURA.</text>
  <text x="102" y="306" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#c9c2b7" letter-spacing="11">HOSTESS &amp; EVENTS</text>
  <rect x="100" y="372" width="56" height="2" fill="#a97c3f"/>
  <text x="100" y="440" font-family="Georgia, 'Times New Roman', serif" font-size="50" fill="#faf7f2">Hostess-csapat pécsi rendezvényekre</text>
  <text x="100" y="500" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#c9c2b7">Bejelentett hostessek · számlával · írásos eligazítással</text>
</svg>`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile('public/og/aura-alap.png');

const ikon = await readFile('public/favicon.svg');
await sharp(ikon, { density: 300 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(ikon, { density: 300 }).resize(32, 32).png().toFile('public/favicon-32.png');

console.log('Kész: public/og/aura-alap.png, public/apple-touch-icon.png, public/favicon-32.png');
