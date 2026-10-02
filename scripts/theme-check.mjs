#!/usr/bin/env node
// Runs Shopify Theme Check (config: .theme-check.yml) without needing the Shopify CLI.
// Errors fail the run; warnings and info are reported only.
import { check } from '@shopify/theme-check-node';

const root = process.cwd();
const SEVERITY = ['error', 'warning', 'info'];
const offenses = await check(root);

for (const o of offenses) {
  const file = decodeURIComponent(o.uri.replace(/^file:\/\//, '')).replace(`${root}/`, '');
  const line = (o.start?.line ?? 0) + 1;
  console.log(`${SEVERITY[o.severity].padEnd(8)} ${file}:${line} [${o.check}] ${o.message}`);
}

const errorCount = offenses.filter((o) => o.severity === 0).length;
console.log(`\ntheme-check: ${errorCount} error(s), ${offenses.length - errorCount} other offense(s)`);
process.exit(errorCount ? 1 : 0);
