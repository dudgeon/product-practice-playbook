// Compile a notional three-tier spine (the lifecycle in content/lifecycle.json,
// the enablement shelf in content/enablers.json) into the enriched structure the
// site renders from — auto numbers, derived soft tints, slugified ids,
// normalized defaults — and validate the wider content store against it.
// Pure functions; no file I/O.
//
// Both spines share one shape: root → mid → leaf. The lifecycle reads
// phase → subphase → activity; the enablement spine reads track → area →
// enabler. The generic compiler/mergers below are parameterized by a SHAPE so
// the two stay structurally identical; the lifecycle-named exports are thin
// wrappers that preserve the original API and messages exactly.

// Fallback hues for roots that don't pin one (teal · indigo · green · amber · plum · slate).
const DEFAULT_PALETTE = ['#2d6a6a', '#4a5a8a', '#3a7a4a', '#8a5a2d', '#6a2d6a', '#43618a'];

/** The two spine shapes: tier key names + labels + the source file (for messages). */
export const LIFECYCLE_SHAPE = {
  file: 'lifecycle.json',
  root: 'phases',
  rootLabel: 'Phase',
  mid: 'subphases',
  midLabel: 'Subphase',
  leaf: 'activities',
  leafLabel: 'Activity',
};
export const ENABLEMENT_SHAPE = {
  file: 'enablers.json',
  root: 'tracks',
  rootLabel: 'Track',
  mid: 'areas',
  midLabel: 'Area',
  leaf: 'enablers',
  leafLabel: 'Enabler',
};

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
 * Compile a raw spine file into the structure the renderer expects.
 * Throws on structural problems (missing names, duplicate ids).
 *
 * Hierarchy: root → mid → leaf. Each compiled root carries its mid groups (the
 * structure the boards + root pages render from) AND a flattened leaf list
 * (every lookup, the build loop, and leaf pages read this — so a leaf stays
 * addressable by its globally-unique id and a use case places by the leaf
 * alone, with the mid tier derived). A root may also use a flat leaf array
 * with no mid groups — it compiles as a single implicit mid group, which is
 * both the back-compat path and how an emergent taxonomy starts flat.
 */
export function compileSpine(raw, shape) {
  const { file, root, rootLabel, mid, midLabel, leaf, leafLabel } = shape;
  if (!raw || !Array.isArray(raw[root])) {
    throw new Error(`${file} must be an object with a "${root}" array.`);
  }
  const seenRoot = new Set();
  const seenMid = new Set();
  const seenLeaf = new Set();

  const roots = raw[root].map((p, i) => {
    if (!p.name) throw new Error(`${rootLabel} #${i + 1} is missing a name.`);
    const id = p.id || slug(p.name);
    if (!id) throw new Error(`${rootLabel} #${i + 1} ("${p.name}") could not derive an id.`);
    if (seenRoot.has(id)) throw new Error(`Duplicate ${rootLabel.toLowerCase()} id "${id}".`);
    seenRoot.add(id);

    const hue = isHex(p.hue) ? p.hue : DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
    const soft = isHex(p.soft) ? p.soft : softFromHue(hue);

    const compileLeaf = (a, j, where) => {
      if (!a.name) throw new Error(`${leafLabel} #${j + 1} in ${where} is missing a name.`);
      const aid = a.id || slug(a.name);
      if (seenLeaf.has(aid)) throw new Error(`Duplicate ${leafLabel.toLowerCase()} id "${aid}".`);
      seenLeaf.add(aid);
      const out = { id: aid, name: a.name, canon: a.canon ?? null };
      if (a.editor) out.editor = a.editor;
      return out;
    };

    // New shape: mid[] each holding leaf[]. Back-compat / flat-start: a flat
    // leaf[] becomes one implicit mid group carrying the root's identity.
    const rawMids = Array.isArray(p[mid])
      ? p[mid]
      : [{ id, name: p.name, [leaf]: p[leaf] || [], implicit: true }];

    const mids = rawMids.map((s, k) => {
      if (!s.name)
        throw new Error(`${midLabel} #${k + 1} in ${rootLabel.toLowerCase()} "${id}" is missing a name.`);
      const sid = s.id || slug(s.name);
      if (!sid)
        throw new Error(`${midLabel} #${k + 1} in ${rootLabel.toLowerCase()} "${id}" could not derive an id.`);
      if (seenMid.has(sid)) throw new Error(`Duplicate ${midLabel.toLowerCase()} id "${sid}".`);
      seenMid.add(sid);
      const leaves = (s[leaf] || []).map((a, j) =>
        compileLeaf(a, j, `${midLabel.toLowerCase()} "${sid}"`)
      );
      return {
        id: sid,
        n: `${String(i + 1).padStart(2, '0')}.${k + 1}`,
        name: s.name,
        tagline: s.tagline || '',
        canon: s.canon ?? null,
        editor: s.editor ?? null,
        implicit: !!s.implicit,
        [leaf]: leaves,
      };
    });

    // Flattened view — the spine's leaf list, in order, across all mid groups.
    const leaves = mids.flatMap((s) => s[leaf]);

    return {
      id,
      n: String(i + 1).padStart(2, '0'),
      name: p.name,
      hue,
      soft,
      tagline: p.tagline || '',
      canon: p.canon ?? null,
      editor: p.editor ?? null,
      [mid]: mids,
      [leaf]: leaves,
    };
  });

  return { [root]: roots };
}

/** Compile content/lifecycle.json — phase → subphase → activity. */
export function compileLifecycle(raw) {
  return compileSpine(raw, LIFECYCLE_SHAPE);
}

/** Compile content/enablers.json — track → area → enabler. */
export function compileEnablement(raw) {
  return compileSpine(raw, ENABLEMENT_SHAPE);
}

// ---- Per-root editorial prose (content/phases/<id>.md, content/tracks/<id>.md) --
//
// The spine *skeleton* (ids, names, order, hue, tagline) stays in the JSON
// file; the editorial *prose* (canon + the editor's note) is authored as
// Markdown and merged back into the compiled snapshot here, so the renderers —
// which expect canon as a plain string and editor as { lead, body, points } —
// are unchanged. Leaf-level prose rides in the file's frontmatter, keyed by
// leaf id under the spine's leaf key ("activities" / "enablers").

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

/** Parse a per-root Markdown body into { canon, editor }. */
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
 * Merge per-root prose (keyed by root id) into a compiled spine in place.
 * `prose[id] = { canon, editor, <leafKey>: { <leafId>: { canon, editor } } }`.
 */
export function mergeSpineProse(roots, proseById = {}, leafKey = 'activities') {
  for (const p of roots) {
    const prose = proseById[p.id];
    if (!prose) continue;
    if (prose.canon != null) p.canon = prose.canon;
    if (prose.editor) p.editor = prose.editor;
    const leaves = prose[leafKey] || {};
    for (const a of p[leafKey]) {
      const ap = leaves[a.id];
      if (!ap) continue;
      if (ap.canon != null) a.canon = ap.canon;
      if (ap.editor) a.editor = ap.editor;
    }
  }
  return roots;
}

/** Merge per-phase prose into the compiled lifecycle (original API). */
export function mergePhaseProse(phases, proseById = {}) {
  return mergeSpineProse(phases, proseById, 'activities');
}

/**
 * Validate that every root has its prose file, every prose file matches a root,
 * and every leaf key in a prose file is a real leaf of that root.
 */
export function validateSpineProse(
  roots,
  proseById = {},
  { kind = 'phase', dir = 'content/phases', sourceFile = 'lifecycle.json', leafKind = 'activity', leafKey = 'activities' } = {}
) {
  const errors = [];
  const rootById = new Map(roots.map((p) => [p.id, p]));
  for (const p of roots) {
    if (!proseById[p.id]) {
      errors.push(`${kind} "${p.id}": no prose file (expected ${dir}/${p.id}.md).`);
      continue;
    }
    if (!p.canon) errors.push(`${kind} "${p.id}": prose file has no "## Canon" section.`);
    if (!p.editor) errors.push(`${kind} "${p.id}": prose file has no "## Editor's note" section.`);
  }
  for (const [id, prose] of Object.entries(proseById)) {
    const p = rootById.get(id);
    if (!p) {
      errors.push(`${dir}/${id}.md: no ${kind} "${id}" in ${sourceFile}.`);
      continue;
    }
    const leafIds = new Set(p[leafKey].map((a) => a.id));
    for (const aid of Object.keys(prose[leafKey] || {})) {
      if (!leafIds.has(aid)) {
        errors.push(`${dir}/${id}.md: ${leafKind} "${aid}" is not in ${kind} "${id}".`);
      }
    }
  }
  return errors;
}

/** Validate the per-phase prose against the compiled lifecycle (original API). */
export function validatePhaseProse(phases, proseById = {}) {
  return validateSpineProse(phases, proseById, {
    kind: 'phase',
    dir: 'content/phases',
    sourceFile: 'lifecycle.json',
    leafKind: 'activity',
    leafKey: 'activities',
  });
}

/** Validate the per-track prose against the compiled enablement spine. */
export function validateTrackProse(tracks, proseById = {}) {
  return validateSpineProse(tracks, proseById, {
    kind: 'track',
    dir: 'content/tracks',
    sourceFile: 'enablers.json',
    leafKind: 'enabler',
    leafKey: 'enablers',
  });
}

/**
 * Validate the content store against the compiled spines. Returns hard `errors`
 * (broken placements / unknown tags or refs — these would crash the render) and
 * softer `warnings`, plus nothing else.
 *
 * Placement is a union: a use case sits on exactly one spine — either
 * `phase` + `activity` (lifecycle) or `track` + `enabler` (enablement).
 * `enabled_by` is an OPTIONAL list of enabler ids on any use case; absence is
 * never flagged (most authors won't know their preconditions — by design),
 * but an unknown id fails the build.
 */
export function validateContent({ phases, tracks = [], usecases, techniques }) {
  const phaseById = new Map(phases.map((p) => [p.id, p]));
  const trackById = new Map(tracks.map((t) => [t.id, t]));
  const techIds = new Set(techniques.map((t) => t.id));
  const enablerIds = new Set(tracks.flatMap((t) => t.enablers.map((e) => e.id)));
  const errors = [];
  const warnings = [];

  // The two spines share styling (`p-<id>`) and lookup namespaces — keep their
  // ids disjoint so a card class or a leaf reference can never be ambiguous.
  const activityIds = new Set(phases.flatMap((p) => p.activities.map((a) => a.id)));
  for (const t of tracks) {
    if (phaseById.has(t.id)) errors.push(`track id "${t.id}" collides with a phase id.`);
    for (const e of t.enablers) {
      if (activityIds.has(e.id)) errors.push(`enabler id "${e.id}" collides with an activity id.`);
    }
  }

  // Required frontmatter + unique ids — the use-case "schema" the loader assumes.
  // Placement requirements depend on the spine the use case is reaching for.
  const seenUsecase = new Set();
  for (const u of usecases) {
    const label = u.id ? `"${u.id}"` : '(missing id)';
    const onEnablement = !!(u.placement.track || u.placement.enabler);
    const REQUIRED = [
      ['id', (x) => x.id],
      ['title', (x) => x.title],
      ...(onEnablement
        ? [
            ['track', (x) => x.placement.track],
            ['enabler', (x) => x.placement.enabler],
          ]
        : [
            ['phase', (x) => x.placement.phase],
            ['activity', (x) => x.placement.activity],
          ]),
    ];
    const missing = REQUIRED.filter(([, get]) => !get(u)).map(([k]) => k);
    if (missing.length) {
      errors.push(`use case ${label}: missing required frontmatter — ${missing.join(', ')}.`);
    }
    if ((u.placement.phase || u.placement.activity) && onEnablement) {
      errors.push(
        `use case ${label}: places on both the lifecycle (phase/activity) and the enablement spine (track/enabler) — pick one.`
      );
    }
    if (u.id) {
      if (seenUsecase.has(u.id)) errors.push(`duplicate use-case id "${u.id}".`);
      seenUsecase.add(u.id);
    }
  }

  for (const u of usecases) {
    if (u.placement.track || u.placement.enabler) {
      const tr = trackById.get(u.placement.track);
      if (!tr) {
        errors.push(`use case "${u.id}": unknown track "${u.placement.track}".`);
      } else if (u.placement.enabler && !tr.enablers.some((e) => e.id === u.placement.enabler)) {
        errors.push(`use case "${u.id}": enabler "${u.placement.enabler}" is not in track "${tr.id}".`);
      }
    } else {
      const ph = phaseById.get(u.placement.phase);
      if (!ph) {
        errors.push(`use case "${u.id}": unknown phase "${u.placement.phase}".`);
      } else if (!ph.activities.some((a) => a.id === u.placement.activity)) {
        errors.push(`use case "${u.id}": activity "${u.placement.activity}" is not in phase "${ph.id}".`);
      }
    }
    if (u.enabled_by != null && !Array.isArray(u.enabled_by)) {
      errors.push(`use case "${u.id}": "enabled_by" must be an array of enabler ids.`);
    }
    for (const eid of Array.isArray(u.enabled_by) ? u.enabled_by : []) {
      if (!enablerIds.has(eid)) errors.push(`use case "${u.id}": unknown enabler "${eid}" in enabled_by.`);
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
