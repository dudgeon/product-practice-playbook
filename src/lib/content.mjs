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
import {
  compileLifecycle,
  compileEnablement,
  parseSpineProse,
  mergeSpineProse,
} from './lifecycle.mjs';

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

// Read a spine's per-root editorial prose (content/<dirName>/<id>.md) into a
// map keyed by root id: { canon, editor, <leafKey>: { <leafId>: { canon, editor } } }.
function loadSpineProse(dirName, leafKey) {
  const dir = path.join(CONTENT, dirName);
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const file of readDir(dirName)) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const id = data.id || path.basename(file, '.md');
    out[id] = { id, ...parseSpineProse(content), [leafKey]: data[leafKey] || {} };
  }
  return out;
}

/** Per-phase prose: { canon, editor, activities: { <activityId>: {…} } }. */
export function loadPhaseProse() {
  return loadSpineProse('phases', 'activities');
}

/** Per-track prose: { canon, editor, enablers: { <enablerId>: {…} } }. */
export function loadTrackProse() {
  return loadSpineProse('tracks', 'enablers');
}

export function loadContent() {
  const site = readJSON('site.json');
  // The spine: skeleton compiled from lifecycle.json, prose merged from
  // content/phases/<id>.md (so canon + the editor's note are authored as Markdown).
  const { phases } = compileLifecycle(readJSON('lifecycle.json'));
  const phaseProse = loadPhaseProse();
  mergeSpineProse(phases, phaseProse, 'activities');

  // The enablement spine (the second axis): tracks → areas → enablers, compiled
  // from enablers.json with prose merged from content/tracks/<id>.md. The whole
  // shelf is optional — no file, no tracks, and the site renders lifecycle-only.
  const enablersFile = path.join(CONTENT, 'enablers.json');
  const { tracks } = fs.existsSync(enablersFile)
    ? compileEnablement(readJSON('enablers.json'))
    : { tracks: [] };
  const trackProse = loadTrackProse();
  mergeSpineProse(tracks, trackProse, 'enablers');

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

  // Placement is a union: a use case sits on exactly one spine — lifecycle
  // (phase + activity) or enablement (track + enabler). Validation enforces it.
  const usecases = readDir('usecases').map((file) => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const sections = splitSections(content);
    return {
      ...data,
      placement: {
        phase: data.phase,
        activity: data.activity,
        track: data.track,
        enabler: data.enabler,
      },
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
  // Walk phase → subphase → activity so a resolved activity carries both its
  // phase and the subphase it sits in (the subphase is derived from the activity,
  // never stored on the use case). Returns null if the id resolves to no activity.
  const activity = (id) => {
    for (const p of phases) {
      for (const s of p.subphases) {
        const a = s.activities.find((x) => x.id === id);
        if (a) return { ...a, phase: p, subphase: s };
      }
    }
    return null;
  };
  const subphase = (id) => {
    for (const p of phases) {
      const s = p.subphases.find((x) => x.id === id);
      if (s) return { ...s, phase: p };
    }
    return null;
  };
  const technique = (id) => techniques.find((t) => t.id === id);
  const usecase = (id) => usecases.find((u) => u.id === id);
  const aboutPage = (which) => about.find((a) => a.which === which);

  // ---- Enablement-spine lookups (mirrors of the lifecycle helpers) ----
  const track = (id) => tracks.find((t) => t.id === id);
  // Walk track → area → enabler so a resolved enabler carries both its track
  // and the area it sits in (the area is derived from the enabler, never
  // stored on the use case). Returns null if the id resolves to no enabler.
  const enabler = (id) => {
    for (const t of tracks) {
      for (const ar of t.areas) {
        const e = ar.enablers.find((x) => x.id === id);
        if (e) return { ...e, track: t, area: ar };
      }
    }
    return null;
  };
  const area = (id) => {
    for (const t of tracks) {
      const ar = t.areas.find((x) => x.id === id);
      if (ar) return { ...ar, track: t };
    }
    return null;
  };

  const ucByPhase = (pid) => usecases.filter((u) => u.placement.phase === pid);
  const ucByActivity = (aid) => usecases.filter((u) => u.placement.activity === aid);
  const ucBySubphase = (sid) => {
    const s = subphase(sid);
    if (!s) return [];
    const ids = new Set(s.activities.map((a) => a.id));
    return usecases.filter((u) => ids.has(u.placement.activity));
  };
  const ucByTechnique = (tid) => usecases.filter((u) => u.techniques.includes(tid));
  const techCount = (tid) => ucByTechnique(tid).length;

  const ucByTrack = (tid) => usecases.filter((u) => u.placement.track === tid);
  const ucByEnabler = (eid) => usecases.filter((u) => u.placement.enabler === eid);
  // The reverse edge of `enabled_by`: lifecycle use cases that declare this
  // enabler as a precondition — the "unlocks" list, and the demand signal.
  const ucEnabledBy = (eid) =>
    usecases.filter((u) => Array.isArray(u.enabled_by) && u.enabled_by.includes(eid));

  const techniquesInPhase = (pid) =>
    [...new Set(ucByPhase(pid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);
  const techniquesInActivity = (aid) =>
    [...new Set(ucByActivity(aid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);
  const techniquesInTrack = (tid) =>
    [...new Set(ucByTrack(tid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);
  const techniquesInEnabler = (eid) =>
    [...new Set(ucByEnabler(eid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);

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
    tracks,
    trackProse,
    techniques,
    usecases,
    about,
    phase,
    activity,
    subphase,
    track,
    area,
    enabler,
    technique,
    usecase,
    aboutPage,
    ucByPhase,
    ucByActivity,
    ucBySubphase,
    ucByTrack,
    ucByEnabler,
    ucEnabledBy,
    ucByTechnique,
    techCount,
    techniquesInPhase,
    techniquesInActivity,
    techniquesInTrack,
    techniquesInEnabler,
    featured,
    activityEndorsed,
  };
}
