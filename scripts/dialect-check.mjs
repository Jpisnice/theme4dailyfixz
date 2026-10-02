#!/usr/bin/env node
// Enforces this theme's dialect conventions.
// These are hard rules: any error fails `npm run check`, CI, and a sprint.
//
// Architecture note: this theme was migrated from a block-first dialect (which
// relied on the unreleased {% block %} developer preview) to the standard
// Online Store 2.0 model: sections/ with {% schema %} and presets, JSON
// templates, and section groups for the header/footer. The checks below reflect
// that model.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

const exists = (p) => stat(join(root, p)).then(() => true, () => false);
async function files(dir, ext) {
  if (!(await exists(dir))) return [];
  const entries = await readdir(join(root, dir));
  return entries.filter((f) => f.endsWith(ext)).map((f) => join(dir, f));
}

const liquidDirs = ['layout', 'templates', 'blocks', 'snippets', 'sections'];
for (const dir of liquidDirs) {
  for (const file of await files(dir, '.liquid')) {
    const raw = await readFile(join(root, file), 'utf8');
    // Ignore documentation and comments (e.g. @example usages), keeping line numbers intact.
    const src = raw.replace(
      /\{%-?\s*(doc|comment)\s*-?%\}[\s\S]*?\{%-?\s*end\1\s*-?%\}/g,
      (m) => m.replace(/[^\n]/g, ' '),
    );

    // Sections and theme blocks are customized in the theme editor, so each
    // needs a {% schema %}.
    if (dir === 'sections' || dir === 'blocks') {
      if (!/\{%-?\s*schema\s*-?%\}/.test(src)) errors.push(`${file}: must include a {% schema %}`);
    }

    // Theme blocks rendered dynamically must document their interface and
    // output their editor attributes on the root element.
    if (dir === 'blocks') {
      if (!/^\s*\{%-?\s*doc\s*-?%\}/.test(raw)) errors.push(`${file}: must open with a {% doc %} header`);
      if (!src.includes('block.shopify_attributes')) errors.push(`${file}: root element must output {{ block.shopify_attributes }}`);
    }

    if (dir === 'snippets' && !/^\s*\{%-?\s*doc\s*-?%\}/.test(raw)) {
      warnings.push(`${file}: snippets should open with a {% doc %} header`);
    }
  }
}

for (const w of warnings) console.log(`warning  ${w}`);
for (const e of errors) console.log(`error    ${e}`);
console.log(`\ndialect-check: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
