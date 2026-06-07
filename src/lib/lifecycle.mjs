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
 */
export function compileLifecycle(raw) {
  if (!raw || !Array.isArray(raw.phases)) {
    throw new Error('lifecycle.json must be an object with a "phases" array.');
  }
  const seenPhase = new Set();
  const seenActivity = new Set();

  const phases = raw.phases.map((p, i) => {
    if (!p.name) throw new Error(`Phase #${i + 1} is missing a name.`);
    const id = p.id || slug(p.name);
    if (!id) throw new Error(`Phase #${i + 1} ("${p.name}") could not derive an id.`);
    if (seenPhase.has(id)) throw new Error(`Duplicate phase id "${id}".`);
    seenPhase.add(id);

    const hue = isHex(p.hue) ? p.hue : DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    const soft = isHex(p.soft) ? p.soft : softFromHue(hue);

    const activities = (p.activities || []).map((a, j) => {
      if (!a.name) throw new Error(`Activity #${j + 1} in phase "${id}" is missing a name.`);
      const aid = a.id || slug(a.name);
      if (seenActivity.has(aid)) throw new Error(`Duplicate activity id "${aid}".`);
      seenActivity.add(aid);
      const out = { id: aid, name: a.name, canon: a.canon ?? null };
      if (a.editor) out.editor = a.editor;
      return out;
    });

    return {
      id,
      n: String(i + 1).padStart(2, '0'),
      name: p.name,
      hue,
      soft,
      tagline: p.tagline || '',
      canon: p.canon ?? null,
      editor: p.editor ?? null,
      activities,
    };
  });

  return { phases };
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
