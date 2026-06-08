// Compile the notional lifecycle (content/lifecycle.json) into the enriched
// spine the site renders from — auto phase numbers, derived soft tints,
// slugified ids, normalized defaults — and validate the wider content store
// against it. Pure functions; no file I/O.

// Fallback hues for phases that don't pin one (teal · indigo · green · amber · plum · slate).
const DEFAULT_PALETTE = ['#2d6a6a', '#4a5a8a', '#3a7a4a', '#8a5a2d', '#6a2d6a', '#43618a'];

/** Slugify a name into a stable id when one isn't given. */
export const slug = (s = '') =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const hexToRgb = (hex) => {
  const m = String(hex).replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
};
const rgbToHex = (rgb) => '#' + rgb.map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
const isHex = (s) => /^#[0-9a-f]{6}$/i.test(String(s));

/** A very light background tint of a hue (mixed toward white). */
export function softFromHue(hue, amount = 0.12) {
  const rgb = hexToRgb(hue);
  if (!rgb) return '#eef1ee';
  return rgbToHex(rgb.map((c) => c * amount + 255 * (1 - amount)));
}

/**
 * Compile the raw lifecycle.json into the spine the renderer expects.
 * Throws on structural problems (missing names, duplicate ids).
 *
 * Hierarchy: phase → subphase → activity. Each compiled phase carries its
 * `subphases` (the grouped structure the spine + phase page render from) AND a
 * flattened `activities` list (every lookup, the build loop, and activity pages
 * read this — so an activity stays addressable by its globally-unique id and a
 * use case still places by activity alone, with the subphase derived). A phase
 * may also use a flat `activities` array with no subphases — it compiles as a
 * single implicit subphase, so older lifecycle.json files keep working.
 */
export function compileLifecycle(raw) {
  if (!raw || !Array.isArray(raw.phases)) {
    throw new Error('lifecycle.json must be an object with a "phases" array.');
  }
  const seenPhase = new Set();
  const seenSubphase = new Set();
  const seenActivity = new Set();

  const phases = raw.phases.map((p, i) => {
    if (!p.name) throw new Error(`Phase #${i + 1} is missing a name.`);
    const id = p.id || slug(p.name);
    if (!id) throw new Error(`Phase #${i + 1} ("${p.name}") could not derive an id.`);
    if (seenPhase.has(id)) throw new Error(`Duplicate phase id "${id}".`);
    seenPhase.add(id);

    const hue = isHex(p.hue) ? p.hue : DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    const soft = isHex(p.soft) ? p.soft : softFromHue(hue);

    const compileActivity = (a, j, where) => {
      if (!a.name) throw new Error(`Activity #${j + 1} in ${where} is missing a name.`);
      const aid = a.id || slug(a.name);
      if (seenActivity.has(aid)) throw new Error(`Duplicate activity id "${aid}".`);
      seenActivity.add(aid);
      const out = { id: aid, name: a.name, canon: a.canon ?? null };
      if (a.editor) out.editor = a.editor;
      return out;
    };

    // New shape: subphases[] each holding activities[]. Back-compat: a flat
    // activities[] becomes one implicit subphase carrying the phase's identity.
    const rawSubs = Array.isArray(p.subphases)
      ? p.subphases
      : [{ id, name: p.name, activities: p.activities || [], implicit: true }];

    const subphases = rawSubs.map((s, k) => {
      if (!s.name) throw new Error(`Subphase #${k + 1} in phase "${id}" is missing a name.`);
      const sid = s.id || slug(s.name);
      if (!sid) throw new Error(`Subphase #${k + 1} in phase "${id}" could not derive an id.`);
      if (seenSubphase.has(sid)) throw new Error(`Duplicate subphase id "${sid}".`);
      seenSubphase.add(sid);
      const activities = (s.activities || []).map((a, j) =>
        compileActivity(a, j, `subphase "${sid}"`)
      );
      return {
        id: sid,
        n: `${String(i + 1).padStart(2, '0')}.${k + 1}`,
        name: s.name,
        tagline: s.tagline || '',
        canon: s.canon ?? null,
        editor: s.editor ?? null,
        implicit: !!s.implicit,
        activities,
      };
    });

    // Flattened view — the spine's leaf list, in order, across all subphases.
    const activities = subphases.flatMap((s) => s.activities);

    return {
      id,
      n: String(i + 1).padStart(2, '0'),
      name: p.name,
      hue,
      soft,
      tagline: p.tagline || '',
      canon: p.canon ?? null,
      editor: p.editor ?? null,
      subphases,
      activities,
    };
  });

  return { phases };
}

// ---- Per-phase editorial prose (lives in content/phases/<id>.md) ----------
//
// The spine *skeleton* (ids, names, order, hue, tagline) stays in lifecycle.json;
// the editorial *prose* (canon + the editor's note) is authored as Markdown and
// merged back into the compiled snapshot here, so the renderers — which expect
// canon as a plain string and editor as { lead, body, points } — are unchanged.

/** Split a Markdown body into `## Heading` sections, in order. */
export function splitSections(body) {
  const parts = String(body).split(/^##[ \t]+(.+)$/m);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    out.push({ heading: parts[i].trim(), body: (parts[i + 1] || '').trim() });
  }
  return out;
}

/**
 * Parse an editor's-note Markdown block into the { lead, body, points } shape
 * the editorNote component renders: leading paragraphs map to lead then body,
 * and a bullet list maps to points (raw text, **bold** preserved for renderBold).
 */
export function parseEditorNote(text = '') {
  const blocks = String(text)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const paras = [];
  const points = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim());
    if (lines.length && lines.every((l) => /^-\s+/.test(l))) {
      for (const l of lines) points.push(l.replace(/^-\s+/, ''));
    } else {
      paras.push(block.replace(/\n+/g, ' ').trim());
    }
  }
  const out = {};
  if (paras[0]) out.lead = paras[0];
  if (paras.length > 1) out.body = paras.slice(1).join(' ');
  if (points.length) out.points = points;
  return Object.keys(out).length ? out : null;
}

/** Parse a per-phase Markdown body into { canon, editor }. */
export function parseSpineProse(content = '') {
  const sections = splitSections(content);
  const find = (h) => sections.find((s) => s.heading.toLowerCase() === h)?.body || '';
  const canonText = find('canon');
  return {
    canon: canonText || null,
    editor: parseEditorNote(find("editor's note")),
  };
}

/**
 * Merge per-phase prose (keyed by phase id) into the compiled spine in place.
 * `prose[id] = { canon, editor, activities: { <activityId>: { canon, editor } } }`.
 */
export function mergePhaseProse(phases, proseById = {}) {
  for (const p of phases) {
    const prose = proseById[p.id];
    if (!prose) continue;
    if (prose.canon != null) p.canon = prose.canon;
    if (prose.editor) p.editor = prose.editor;
    const acts = prose.activities || {};
    for (const a of p.activities) {
      const ap = acts[a.id];
      if (!ap) continue;
      if (ap.canon != null) a.canon = ap.canon;
      if (ap.editor) a.editor = ap.editor;
    }
  }
  return phases;
}

/**
 * Validate that every phase has its prose file, every prose file matches a phase,
 * and every activity key in a prose file is a real activity in that phase.
 */
export function validatePhaseProse(phases, proseById = {}) {
  const errors = [];
  const phaseById = new Map(phases.map((p) => [p.id, p]));
  for (const p of phases) {
    if (!proseById[p.id]) {
      errors.push(`phase "${p.id}": no prose file (expected content/phases/${p.id}.md).`);
      continue;
    }
    if (!p.canon) errors.push(`phase "${p.id}": prose file has no "## Canon" section.`);
    if (!p.editor) errors.push(`phase "${p.id}": prose file has no "## Editor's note" section.`);
  }
  for (const [id, prose] of Object.entries(proseById)) {
    const p = phaseById.get(id);
    if (!p) {
      errors.push(`content/phases/${id}.md: no phase "${id}" in lifecycle.json.`);
      continue;
    }
    const activityIds = new Set(p.activities.map((a) => a.id));
    for (const aid of Object.keys(prose.activities || {})) {
      if (!activityIds.has(aid)) {
        errors.push(`content/phases/${id}.md: activity "${aid}" is not in phase "${id}".`);
      }
    }
  }
  return errors;
}

/**
 * Validate the content store against the compiled spine. Returns hard `errors`
 * (broken placements / unknown tags — these would crash the render) and softer
 * `warnings`, plus a `coverage` summary.
 */
export function validateContent({ phases, usecases, techniques }) {
  const phaseById = new Map(phases.map((p) => [p.id, p]));
  const techIds = new Set(techniques.map((t) => t.id));
  const errors = [];
  const warnings = [];

  // Required frontmatter + unique ids — the use-case "schema" the loader assumes.
  const REQUIRED = [
    ['id', (u) => u.id],
    ['title', (u) => u.title],
    ['phase', (u) => u.placement.phase],
    ['activity', (u) => u.placement.activity],
  ];
  const seenUsecase = new Set();
  for (const u of usecases) {
    const label = u.id ? `"${u.id}"` : '(missing id)';
    const missing = REQUIRED.filter(([, get]) => !get(u)).map(([k]) => k);
    if (missing.length) {
      errors.push(`use case ${label}: missing required frontmatter — ${missing.join(', ')}.`);
    }
    if (u.id) {
      if (seenUsecase.has(u.id)) errors.push(`duplicate use-case id "${u.id}".`);
      seenUsecase.add(u.id);
    }
  }

  for (const u of usecases) {
    const ph = phaseById.get(u.placement.phase);
    if (!ph) {
      errors.push(`use case "${u.id}": unknown phase "${u.placement.phase}".`);
    } else if (!ph.activities.some((a) => a.id === u.placement.activity)) {
      errors.push(`use case "${u.id}": activity "${u.placement.activity}" is not in phase "${ph.id}".`);
    }
    for (const t of u.techniques || []) {
      if (!techIds.has(t)) errors.push(`use case "${u.id}": unknown technique "${t}".`);
    }
  }

  for (const t of techniques) {
    if (!usecases.some((u) => (u.techniques || []).includes(t.id))) {
      warnings.push(`technique "${t.id}" (#${t.name}) has no use cases yet.`);
    }
  }

  return { errors, warnings };
}
