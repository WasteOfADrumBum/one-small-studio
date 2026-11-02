// Renders scripts/og-image/card.html to public/og-image.png (1200x630), the site's share card.
// Usage: npm run og:image
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const card = new URL('./card.html', import.meta.url);
const out = fileURLToPath(new URL('../../public/og-image.png', import.meta.url));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(card.href);
  await page.evaluate('document.fonts.ready');
  await page.screenshot({ path: out, type: 'png' });
  console.log(`Wrote ${out}`);
} finally {
  await browser.close();
}
