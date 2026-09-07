import { chromium } from 'playwright-core';
import fs from 'fs';

const OUT = '/Users/c0rtexzer0/Documents/GitHub/plaidcat/research/defillama-probe/raw';
const captured = [];

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--disable-blink-features=AutomationControlled'],
});
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 },
});
const page = await ctx.newPage();

page.on('response', async (res) => {
  const url = res.url();
  if (url.match(/\/api\/public\/market-makers\//)) {
    try {
      const ct = (res.headers()['content-type'] || '');
      const body = await res.text();
      const name = url.replace(/[^a-z0-9]/gi, '_').slice(-90);
      const file = `${OUT}/mm-api-${name}`;
      fs.writeFileSync(file, `[${res.status()} ${ct}] ${url}\n\n${body}`);
      captured.push({ url, status: res.status(), file, bytes: body.length });
      console.log('CAP', res.status(), url, `(${body.length}b)`);
    } catch (e) { console.log('CAPERR', url, e.message); }
  }
});

await page.goto('https://defillama.com/market-makers', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(18000); // CF challenge + first XHRs

const slugs = ['depth', 'kpi', 'spread', 'volume', 'details'];
for (const s of slugs) {
  console.log('\n=== visiting /market-makers/' + s);
  try {
    await page.goto(`https://defillama.com/market-makers/${s}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(8000);
  } catch (e) { console.log('NAVERR', s, e.message); }
}

fs.writeFileSync(`${OUT}/mm-api-index.json`, JSON.stringify(captured, null, 2));
console.log('\nDONE captured', captured.length, 'API responses');
await browser.close();
