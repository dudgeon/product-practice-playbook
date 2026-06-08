// Build content artifacts from the lifecycle definition.
//
// Run this after editing content/lifecycle.json (the notional stages + key
// activities). It compiles the spine (auto numbers, soft tints, slugged ids),
// writes the generated content/phases.json snapshot, and validates the rest of
// the content store against it — catching use cases that point at a renamed or
// removed stage, or unknown technique tags — then prints a coverage report.
//
//   npm run build-content
//
// Exits non-zero if anything is broken, so it gates `npm run build`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../src/lib/content.mjs';
import { validateContent, validatePhaseProse } from '../src/lib/lifecycle.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');

const tty = process.stdout.isTTY;
const paint = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const c = {
  red: (s) => paint('31', s),
  green: (s) => paint('32', s),
  yellow: (s) => paint('33', s),
  dim: (s) => paint('2', s),
  bold: (s) => paint('1', s),
};

console.log(c.bold('AI PDLC Playbook — build content from lifecycle.json') + '\n');

// 1. Load the content store: compiles the lifecycle skeleton and merges the
//    per-phase Markdown prose. Fail clearly on structural problems.
let db;
try {
  db = loadContent();
} catch (err) {
  console.error(c.red('✗ content store is invalid: ') + err.message);
  process.exit(1);
}
const { phases, phaseProse } = db;
const subphaseCount = phases.reduce((a, p) => a + p.subphases.filter((s) => !s.implicit).length, 0);
const activityCount = phases.reduce((a, p) => a + p.activities.length, 0);

// 1b. Validate the per-phase prose (every phase has its file; no stray files or
//     unknown activity keys) — these would render as silent/blank otherwise.
const proseErrors = validatePhaseProse(phases, phaseProse);
if (proseErrors.length) {
  console.error(c.red(`✗ phase prose — ${proseErrors.length} error(s):`));
  proseErrors.forEach((e) => console.error('  ' + c.red('✗ ') + e));
  process.exit(1);
}

// 2. Materialize the compiled + merged spine snapshot.
fs.writeFileSync(path.join(CONTENT, 'phases.json'), JSON.stringify(phases, null, 2) + '\n');
console.log(
  `Compiled spine: ${c.bold(phases.length + ' phases')}, ${c.bold(subphaseCount + ' subphases')}, ` +
    `${c.bold(activityCount + ' activities')}, ${c.bold(Object.keys(phaseProse).length + ' prose files')} ` +
    `→ wrote content/phases.json ${c.dim('(generated snapshot)')}\n`
);

// 3. Validate placements + technique tags.
const { errors, warnings } = validateContent(db);

if (errors.length) {
  console.log(c.red(`Validation — ${errors.length} error(s):`));
  errors.forEach((e) => console.log('  ' + c.red('✗ ') + e));
} else {
  console.log(c.green(`✓ ${db.usecases.length} use cases — every placement and technique tag resolves.`));
}
console.log('');

// 4. Coverage report.
console.log(c.bold('Coverage'));
for (const p of phases) {
  const total = db.ucByPhase(p.id).length;
  const empty = p.activities.filter((a) => db.ucByActivity(a.id).length === 0).map((a) => a.name);
  console.log(
    `  ${p.n} ${p.name.padEnd(12)} ${String(total).padStart(2)} use case(s) across ${p.activities.length} activities` +
      (empty.length ? c.dim(`  · empty: ${empty.join(', ')}`) : c.green('  · full'))
  );
  for (const s of p.subphases.filter((x) => !x.implicit)) {
    const sTotal = db.ucBySubphase(s.id).length;
    console.log(
      c.dim(`     ${s.n} ${s.name.padEnd(12)} ${String(sTotal).padStart(2)} uc · ${s.activities.length} activities`)
    );
  }
}
const emptyTechs = db.techniques.filter((t) => db.ucByTechnique(t.id).length === 0).map((t) => '#' + t.name);
console.log(
  `  ${c.dim('techniques')}   ${db.techniques.length - emptyTechs.length}/${db.techniques.length} tagged` +
    (emptyTechs.length ? c.dim(`  · empty: ${emptyTechs.join(', ')}`) : '')
);
console.log(
  `  ${c.dim('featured')}     ${db.featured().length}    ${c.dim('endorsed use cases')} ${db.usecases.filter((u) => u.endorsed).length}\n`
);

if (warnings.length) {
  console.log(c.yellow(`Notes (${warnings.length}):`));
  warnings.forEach((w) => console.log('  ' + c.yellow('• ') + w));
  console.log('');
}

if (errors.length) {
  console.log(c.red('Content build failed — fix the errors above (usually a use case pointing at a renamed/removed stage).'));
  process.exit(1);
}
console.log(c.green('Content is render-ready. Run `npm run build` (or the build-site skill) to generate the site.'));
