#!/usr/bin/env node
// Enforces this theme's block-first dialect (see README "Non-negotiables").
// These are hard rules: any error fails `npm run check`, CI, and a sprint.
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

if (await exists('sections')) errors.push('sections/: directory must not exist (block-first theme)');

for (const f of await files('templates', '.json')) errors.push(`${f}: JSON templates are not allowed; use templates/*.liquid`);

const liquidDirs = ['layout', 'templates', 'blocks', 'snippets'];
for (const dir of liquidDirs) {
  for (const file of await files(dir, '.liquid')) {
    const raw = await readFile(join(root, file), 'utf8');
    // Ignore documentation and comments (e.g. @example usages), keeping line numbers intact.
    const src = raw.replace(
      /\{%-?\s*(doc|comment)\s*-?%\}[\s\S]*?\{%-?\s*end\1\s*-?%\}/g,
      (m) => m.replace(/[^\n]/g, ' '),
    );
    const lineOf = (idx) => src.slice(0, idx).split('\n').length;
    const flag = (re, msg, list = errors) => {
      for (const m of src.matchAll(re)) list.push(`${file}:${lineOf(m.index)}: ${msg}`);
    };

    flag(/\{%-?\s*sections?\s/g, 'no {% section %} / {% sections %} tags');
    flag(/\{%-?\s*(stylesheet|javascript)\s*-?%\}/g, 'no {% stylesheet %} / {% javascript %}; put CSS/JS in assets/');
    flag(/"presets"\s*:/g, 'schema "presets" are not allowed');

    if (dir === 'blocks' || dir === 'snippets') {
      flag(/\{%-?\s*block\s+['"]/g, 'executable {% block %} calls belong only in layout/ and templates/');
    }

    if (dir === 'blocks') {
      if (!/^\s*\{%-?\s*doc\s*-?%\}/.test(raw)) errors.push(`${file}: must open with a {% doc %} header`);
      if (!/\{%-?\s*schema\s*-?%\}/.test(src)) errors.push(`${file}: must end with a {% schema %}`);
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
