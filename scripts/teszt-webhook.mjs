// Helyi teszt-webhook: kiírja (és a teszt-webhook.log fájlba menti) a beérkező űrlapokat.
// Futtatás:  npm run webhook:teszt            → 200 OK válasz
//            npm run webhook:teszt -- --hiba  → 500-as hiba (a hibaág teszteléséhez)
// Majd a .env-ben: CRM_WEBHOOK_URL=http://127.0.0.1:8199/
import { createServer } from 'node:http';
import { appendFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';

const PORT = Number(process.env.WEBHOOK_PORT ?? 8199);
const hibat = process.argv.includes('--hiba');
const titok = process.env.CRM_WEBHOOK_SECRET;

createServer((req, res) => {
  let torzs = '';
  req.on('data', (d) => (torzs += d));
  req.on('end', () => {
    const ido = new Date().toISOString();
    let alairas = 'nincs';
    if (titok) {
      const vart = 'sha256=' + createHmac('sha256', titok).update(torzs).digest('hex');
      alairas = req.headers['x-aura-signature'] === vart ? 'helyes' : 'HIBÁS';
    }
    console.log(`\n[${ido}] ${req.method} ${req.url}  (aláírás: ${alairas})`);
    try {
      console.log(JSON.stringify(JSON.parse(torzs), null, 2));
    } catch {
      console.log(torzs);
    }
    appendFileSync('teszt-webhook.log', JSON.stringify({ ido, alairas, torzs }) + '\n');
    res.writeHead(hibat ? 500 : 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: !hibat }));
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Teszt-webhook: http://127.0.0.1:${PORT}/  ${hibat ? '(500-as hibát ad)' : '(200 OK)'}`);
});
