#!/usr/bin/env node
/**
 * Fails when the production build grows past its budgets. Run after `npm run build`:
 *   npm run budgets
 *
 * Budgets are gzip sizes for code (what visitors download) and raw sizes for media and fonts
 * (already compressed). Each sits about 10% above the size measured on 2026-11-05, so ordinary
 * changes pass and an accidental new dependency or unoptimised image does not. When a budget
 * has to grow, raise it here in the same PR and say why.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const KB = 1024;
const BUDGETS = {
  // Measured: 252.8 KiB gzip in one entry chunk (React, Mantine, GSAP, Motion, the site).
  jsGzip: 280 * KB,
  jsFiles: 1,
  // Measured: 64.1 KiB gzip.
  cssGzip: 72 * KB,
  // Measured: largest cover 201.6 KiB (the-beauty-of-surrender.jpg).
  imageEach: 225 * KB,
  // Measured: 17 woff2 files, 388.5 KiB in all; a visitor fetches only the subsets a page uses.
  fontsTotal: 430 * KB,
  // Measured: og-image.png 219.3 KiB; share cards are fetched by link previews, not visitors.
  shareImage: 245 * KB,
};

const dist = new URL('../dist/', import.meta.url).pathname;
const assets = join(dist, 'assets');
let files;
try {
  files = readdirSync(assets);
} catch {
  console.error('No dist/assets. Run `npm run build` first.');
  process.exit(1);
}

const size = (f) => statSync(join(assets, f)).size;
const gz = (f) => gzipSync(readFileSync(join(assets, f)), { level: 9 }).length;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const kb = (n) => `${(n / KB).toFixed(1)} KiB`;

const js = files.filter((f) => f.endsWith('.js'));
const css = files.filter((f) => f.endsWith('.css'));
const images = files.filter((f) => /\.(jpe?g|png|webp|avif|gif|svg)$/.test(f));
const fonts = files.filter((f) => /\.(woff2?|ttf|otf)$/.test(f));

const rows = [
  ['JavaScript (gzip)', sum(js.map(gz)), BUDGETS.jsGzip],
  ['JavaScript files', js.length, BUDGETS.jsFiles, String],
  ['CSS (gzip)', sum(css.map(gz)), BUDGETS.cssGzip],
  ['Largest image', Math.max(0, ...images.map(size)), BUDGETS.imageEach],
  ['Fonts (all subsets)', sum(fonts.map(size)), BUDGETS.fontsTotal],
  ['Share image', statSync(join(dist, 'og-image.png')).size, BUDGETS.shareImage],
];

let failed = false;
const lines = ['| Budget | Actual | Limit | |', '| --- | ---: | ---: | --- |'];
for (const [name, actual, limit, fmt = kb] of rows) {
  const ok = actual <= limit;
  failed ||= !ok;
  lines.push(`| ${name} | ${fmt(actual)} | ${fmt(limit)} | ${ok ? 'ok' : '**over**'} |`);
}
const table = lines.join('\n');
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Asset budgets\n\n${table}\n`);
}
if (failed) {
  console.error('\nA budget is exceeded. Shrink the asset, or raise the budget with a reason.');
  process.exit(1);
}
