#!/usr/bin/env node
// Browser smoke test against a running storefront preview (e.g. `shopify theme dev`).
// Visits the core shopper routes at mobile and desktop widths, saves screenshots,
// and fails on HTTP errors, failed requests, or console errors.
//
//   BASE_URL=http://127.0.0.1:9292 OUT_DIR=harness/sprints/01-x/screenshots npm run smoke
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:9292').replace(/\/$/, '');
const OUT_DIR = process.env.OUT_DIR || 'harness/screenshots';
const VIEWPORTS = { mobile: { width: 375, height: 812 }, desktop: { width: 1280, height: 900 } };

async function launch() {
  try {
    return await chromium.launch();
  } catch {
    // Fall back to a preinstalled Chromium when Playwright's own build isn't downloaded.
    return chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  }
}

async function productPath() {
  try {
    const res = await fetch(`${BASE_URL}/products.json?limit=1`);
    const { products } = await res.json();
    if (products?.[0]) return `/products/${products[0].handle}`;
  } catch {}
  return null;
}

const routes = process.env.SMOKE_ROUTES
  ? process.env.SMOKE_ROUTES.split(',')
  : ['/', '/collections/all', await productPath(), '/cart', '/search?q=a', '/this-page-does-not-exist'].filter(Boolean);

await mkdir(OUT_DIR, { recursive: true });
const browser = await launch();
const results = [];

for (const [device, viewport] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext({ viewport });
  for (const route of routes) {
    const page = await context.newPage();
    const problems = [];
    const expected = route === '/this-page-does-not-exist' ? 404 : 200;
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      // The intentional 404 route logs its own document load as an error; that's expected.
      if (expected === 404 && msg.location().url === BASE_URL + route) return;
      problems.push(`console: ${msg.text()} (${msg.location().url})`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
    page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()}`));

    const response = await page.goto(BASE_URL + route, { waitUntil: 'networkidle' }).catch((e) => {
      problems.push(`navigation: ${e.message}`);
      return null;
    });
    if (response && response.status() !== expected) problems.push(`status ${response.status()} (expected ${expected})`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth).catch(() => false);
    if (overflow) problems.push('horizontal overflow');

    const shot = join(OUT_DIR, `${device}_${route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}.png`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    results.push({ device, route, status: response?.status() ?? null, screenshot: shot, problems });
    console.log(`${problems.length ? 'FAIL' : 'PASS'}  ${device.padEnd(7)} ${route}${problems.map((p) => `\n        - ${p}`).join('')}`);
    await page.close();
  }
  await context.close();
}

await browser.close();
await writeFile(join(OUT_DIR, 'smoke.json'), JSON.stringify({ baseUrl: BASE_URL, results }, null, 2));
const failed = results.filter((r) => r.problems.length).length;
console.log(`\nsmoke: ${results.length - failed}/${results.length} passed; screenshots in ${OUT_DIR}`);
process.exit(failed ? 1 : 0);
