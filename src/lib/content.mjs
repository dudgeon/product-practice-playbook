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

export function loadContent() {
  const site = readJSON('site.json');
  const phases = readJSON('phases.json');
  const techniques = readJSON('techniques.json');

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
