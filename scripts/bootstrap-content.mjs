// One-time content bootstrap.
//
// Reads the original Claude Design prototype data module
// (design-reference/pb-data.js) and emits the editable content store the
// static-site build consumes: JSON for structured data, Markdown (with YAML
// frontmatter) for prose. After this has run once, the files under content/
// are the source of truth — pb-data.js is kept only for provenance.
//
//   node scripts/bootstrap-content.mjs
//
// Re-running overwrites content/phases.json, content/techniques.json,
// content/usecases/*.md and content/about/*.md. Hand edits to those files
// will be lost, so treat this as a bootstrap, not part of the build.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const writeFile = (p, body) => {
  const abs = path.join(root, p);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
  console.log('  wrote', p);
};

// --- Evaluate the legacy prototype data module in a sandbox ---------------
const source = read('design-reference/pb-data.js');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const PB = sandbox.window.PB;
if (!PB) throw new Error('Failed to load PB from design-reference/pb-data.js');

console.log('Bootstrapping content from design-reference/pb-data.js …');

// --- Phases (the spine) ---------------------------------------------------
const SOFT = { discover: '#ecf2ef', build: '#e7e9f1', grow: '#e3ede1' };
const phases = PB.PHASES.map((p) => ({
  id: p.id,
  n: p.n,
  name: p.name,
  hue: p.hue,
  soft: SOFT[p.id] || null,
  tagline: p.tagline,
  canon: p.canon ?? null,
  editor: p.editor ?? null,
  activities: p.activities.map((a) => ({
    id: a.id,
    name: a.name,
    canon: a.canon ?? null,
    ...(a.editor ? { editor: a.editor } : {}),
  })),
}));
writeFile('content/phases.json', JSON.stringify(phases, null, 2) + '\n');

// --- Techniques (the horizontal tags) -------------------------------------
const techniques = PB.TECHNIQUES.map((t) => ({
  id: t.id,
  name: t.name,
  endorsed: !!t.endorsed,
  description: t.description,
}));
writeFile('content/techniques.json', JSON.stringify(techniques, null, 2) + '\n');

// --- Use cases (prose as Markdown + metadata as frontmatter) --------------
// Two-entity model: a use case carries an Approach (prose + optional prompt +
// optional resource links). The standalone "Resource" entity is gone, so the
// legacy `resources` id-refs are intentionally dropped.
for (const u of PB.USECASES) {
  const data = {
    id: u.id,
    title: u.title,
    phase: u.placement.phase,
    activity: u.placement.activity,
    featured: !!u.featured,
    endorsed: !!u.endorsed,
    techniques: u.techniques,
    tools: u.tools,
    author: u.author,
  };
  if (u.metric) data.metric = u.metric;
  if (u.prompt) data.prompt = u.prompt;
  if (u.links && u.links.length) data.links = u.links;

  const body = [
    '## Goal',
    '',
    u.problem.trim(),
    '',
    '## Approach',
    '',
    u.solution.trim(),
    '',
    '## Impact',
    '',
    (u.impact || '').trim(),
    '',
  ].join('\n');

  writeFile(`content/usecases/${u.id}.md`, matter.stringify(body, data));
}

// --- About pages ----------------------------------------------------------
const ABOUT_ORDER = { pdlc: 1, editor: 2, initiative: 3 };
for (const [which, a] of Object.entries(PB.ABOUT)) {
  const data = {
    which,
    order: ABOUT_ORDER[which] ?? 99,
    title: a.title,
    lede: a.lede,
  };
  if (which === 'editor') data.portrait = true;
  if (a.draft) data.draft = a.draft;

  const body =
    a.body.map(([h, p]) => `## ${h}\n\n${p}\n`).join('\n') + '\n';
  writeFile(`content/about/${which}.md`, matter.stringify(body, data));
}

console.log('Done. Edit the files under content/ from here on.');
