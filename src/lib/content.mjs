// Content loader + derived data layer.
//
// Reads the JSON + Markdown content store and returns an in-memory database
// with the same lookup/rollup helpers the original prototype exposed on its
// `PB` global (phase/activity/technique lookups, reverse indexes, counts).
// Everything downstream — components and pages — reads from this object.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { compileLifecycle, parseSpineProse, mergePhaseProse } from './lifecycle.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const CONTENT = path.join(ROOT, 'content');

const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(CONTENT, rel), 'utf8'));
const readDir = (rel) =>
  fs
    .readdirSync(path.join(CONTENT, rel))
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(CONTENT, rel, f));

// Split a Markdown body into `## Heading` sections, in order.
function splitSections(body) {
  const parts = String(body).split(/^##[ \t]+(.+)$/m);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    out.push({ heading: parts[i].trim(), body: parts[i + 1].trim() });
  }
  return out;
}

const sectionBody = (sections, heading) =>
  sections.find((s) => s.heading.toLowerCase() === heading.toLowerCase())?.body || '';

// Read the per-phase editorial prose (content/phases/<id>.md) into a map keyed
// by phase id: { canon, editor, activities: { <activityId>: { canon, editor } } }.
export function loadPhaseProse() {
  const dir = path.join(CONTENT, 'phases');
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const file of readDir('phases')) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const id = data.id || path.basename(file, '.md');
    out[id] = { id, ...parseSpineProse(content), activities: data.activities || {} };
  }
  return out;
}

export function loadContent() {
  const site = readJSON('site.json');
  // The spine: skeleton compiled from lifecycle.json, prose merged from
  // content/phases/<id>.md (so canon + the editor's note are authored as Markdown).
  const { phases } = compileLifecycle(readJSON('lifecycle.json'));
  const phaseProse = loadPhaseProse();
  mergePhaseProse(phases, phaseProse);

  // Techniques are a lean JSON tag list; a technique graduates to its own
  // Markdown file (content/techniques/<id>.md) when it needs real explanation —
  // frontmatter overrides scalar fields, the body becomes rich `detail`.
  const techniques = readJSON('techniques.json').map((t) => {
    const file = path.join(CONTENT, 'techniques', `${t.id}.md`);
    if (!fs.existsSync(file)) return t;
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const detail = content.trim();
    return { ...t, ...data, ...(detail ? { detail } : {}) };
  });

  const usecases = readDir('usecases').map((file) => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const sections = splitSections(content);
    return {
      ...data,
      placement: { phase: data.phase, activity: data.activity },
      goal: sectionBody(sections, 'Goal'),
      approach: sectionBody(sections, 'Approach'),
      impact: sectionBody(sections, 'Impact'),
    };
  });

  const about = readDir('about')
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(file, 'utf8'));
      return { ...data, sections: splitSections(content) };
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  // ---- Lookups + reverse indexes (mirror of the prototype helpers) ----
  const phase = (id) => phases.find((p) => p.id === id);
  const activity = (id) => {
    for (const p of phases) {
      const a = p.activities.find((x) => x.id === id);
      if (a) return { ...a, phase: p };
    }
    return null;
  };
  const technique = (id) => techniques.find((t) => t.id === id);
  const usecase = (id) => usecases.find((u) => u.id === id);
  const aboutPage = (which) => about.find((a) => a.which === which);

  const ucByPhase = (pid) => usecases.filter((u) => u.placement.phase === pid);
  const ucByActivity = (aid) => usecases.filter((u) => u.placement.activity === aid);
  const ucByTechnique = (tid) => usecases.filter((u) => u.techniques.includes(tid));
  const techCount = (tid) => ucByTechnique(tid).length;

  const techniquesInPhase = (pid) =>
    [...new Set(ucByPhase(pid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);
  const techniquesInActivity = (aid) =>
    [...new Set(ucByActivity(aid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);

  const featured = () => usecases.filter((u) => u.featured);

  // An activity is "endorsed" if any use case there is endorsed, or applies an
  // endorsed technique — drives the brass dot on the home spine.
  const activityEndorsed = (aid) =>
    ucByActivity(aid).some(
      (u) => u.endorsed || u.techniques.some((tid) => (technique(tid) || {}).endorsed)
    );

  return {
    site,
    phases,
    phaseProse,
    techniques,
    usecases,
    about,
    phase,
    activity,
    technique,
    usecase,
    aboutPage,
    ucByPhase,
    ucByActivity,
    ucByTechnique,
    techCount,
    techniquesInPhase,
    techniquesInActivity,
    featured,
    activityEndorsed,
  };
}
