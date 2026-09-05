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
  if (url.includes('market-makers') || url.includes('mm/') ) {
    try {
      const ct = (res.headers()['content-type'] || '');
      const body = await res.text();
      const name = url.replace(/[^a-z0-9]/gi, '_').slice(-80);
      const file = `${OUT}/mm-capture-${name}`;
      fs.writeFileSync(file, `[${res.status()} ${ct}] ${url}\n\n${body}`);
      captured.push({ url, status: res.status(), file });
      console.log('CAP', res.status(), url, `(${body.length}b) -> ${file.split('/').pop()}`);
    } catch (e) {
      console.log('CAPERR', url, e.message);
    }
  }
});

console.log('Navigating...');
await page.goto('https://defillama.com/market-makers', { waitUntil: 'domcontentloaded', timeout: 60000 });

// Give the CF challenge + XHRs time
await page.waitForTimeout(25000);
console.log('TITLE:', await page.title());
console.log('URL:', page.url());

// Try scrolling to trigger lazy fetches
for (let i = 0; i < 5; i++) {
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(1500);
}

fs.writeFileSync(`${OUT}/mm-capture-index.json`, JSON.stringify(captured, null, 2));
console.log('DONE captured', captured.length, 'responses');
await browser.close();
