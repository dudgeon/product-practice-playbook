// Reusable view components — the design system, as HTML-string functions.
//
// These mirror the prototype's React components one-to-one (same class names,
// same structure) so the rendered markup matches the design's CSS. The
// template gallery imports straight from this module, so every component here
// is a documented, referenceable piece.
//
// Data access mirrors the prototype's `PB` global: call `bindData(db)` once at
// build start, then components read from the module-level `DB`.

import { esc, cx, when, join } from './lib/html.mjs';
import { md, renderBold } from './lib/markdown.mjs';
import { routes } from './lib/links.mjs';

let DB = null;
/** Bind the loaded content database for all components. Call once per build. */
export function bindData(db) {
  DB = db;
}

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

// ---------------------------------------------------------------- icons ----
export const seal = (size = 13) =>
  `<svg class="seal-ico" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.16"/>` +
  `<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2"/>` +
  `<path d="M5 8.2l2 2 4-4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const gh = (size = 14, className = 'gh') =>
  `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" aria-hidden="true">` +
  `<circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.3"/>` +
  `<circle cx="8" cy="8" r="2.1" fill="currentColor"/></svg>`;

export const arrowR = (size = 14) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>`;

const searchIcon =
  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`;

// --------------------------------------------------------- endorsement ----
export const endorsed = ({ lg = false } = {}) =>
  `<span class="${cx('endorsed', lg && 'lg')}">${seal(lg ? 14 : 13)} PDLC-endorsed</span>`;

// ------------------------------------------------------ the three voices ----

// CANON — "what the PDLC says". Brass/official. Renders a silent state when
// no text is supplied. The enablement spine reuses the block under a softened
// label ("The expectation · proposed") and no Protocol seal — there are no
// endorsed expectations on that spine yet, by decision.
export function canon({
  text,
  seal: withSeal = false,
  label = 'What the PDLC says',
  silent: silentText = 'The protocol is silent here — this activity is yours to define.',
} = {}) {
  const silent = !text;
  return (
    `<div class="canon">` +
    `<div class="voice-label"><span class="vmark"></span> ${esc(label)}</div>` +
    when(withSeal, () => `<span class="canon-seal">${seal(12)} Protocol</span>`) +
    `<div class="${cx('canon-text', silent && 'silent')}">` +
    (silent ? esc(silentText) : esc(text)) +
    `</div></div>`
  );
}

// EDITOR'S NOTE — the editor's expansion. `text` is either a plain string
// (single italic line) or a rich object { lead, body, points[] } rendered as
// the section's intro.
export function editorNote({ text, compact = false } = {}) {
  if (!text) return '';
  const rich = typeof text === 'object';
  const inner = rich
    ? `<div class="en-rich">` +
      when(text.lead, () => `<p class="en-lead">${esc(text.lead)}</p>`) +
      when(text.body, () => `<p class="en-para">${esc(text.body)}</p>`) +
      when(
        text.points && text.points.length,
        () =>
          `<ul class="en-points">` +
          text.points.map((p) => `<li>${renderBold(p)}</li>`).join('') +
          `</ul>`
      ) +
      `</div>`
    : `<div class="en-text">${esc(text)}</div>`;
  return (
    `<div class="${cx('editor-note', compact && 'compact', rich && 'rich')}">` +
    `<span class="ava">ED</span>` +
    `<div class="en-body">` +
    `<div class="voice-label"><span class="vmark"></span> Editor's note</div>` +
    inner +
    when(!compact, () => `<div class="en-sig">— The Editor · AI in Product</div>`) +
    `</div></div>`
  );
}

// PRACTICE — section header above field contributions.
export function practiceHead({ title = 'In practice', count, right = '' } = {}) {
  return (
    `<div class="practice-head"><div class="ph-left">` +
    `<div class="voice-label"><span class="vmark"></span> Practice</div>` +
    `<h3>${esc(title)}</h3>` +
    when(count != null, () => `<span class="count">${count}</span>`) +
    `</div>${right}</div>`
  );
}

// ----------------------------------------------------------- tags / author --

// Resolve a use case's spot on whichever spine it sits on: lifecycle
// (phase › activity) or enablement (track › enabler). `root` carries the hue;
// `key` is the root id (drives the p-<id> card classes, generated per spine).
export function resolvePlace(uc) {
  if (uc.placement.track) {
    return {
      root: DB.track(uc.placement.track),
      leaf: DB.enabler(uc.placement.enabler),
      key: uc.placement.track,
      rootRoute: routes.track(uc.placement.track),
    };
  }
  return {
    root: DB.phase(uc.placement.phase),
    leaf: DB.activity(uc.placement.activity),
    key: uc.placement.phase,
    rootRoute: routes.phase(uc.placement.phase),
  };
}

export function placeTag(uc, withActivity = false) {
  const { root, leaf, rootRoute } = resolvePlace(uc);
  const label = root.name + (withActivity && leaf ? ' · ' + leaf.name : '');
  return `<a href="${rootRoute}" class="tag lc" style="--phase:${root.hue}">${esc(label)}</a>`;
}

export function techTag(id) {
  const t = DB.technique(id);
  if (!t) return '';
  return `<a href="${routes.technique(id)}" class="tag tech">${esc(t.name)}</a>`;
}

// An enabler chip — colored by its track, links to the enabler page. Used for
// a use case's optional `enabled_by` list (soft by design: rendered only when
// the author declared it, never demanded).
export function enablerTag(id) {
  const e = DB.enabler(id);
  if (!e) return '';
  return `<a href="${routes.enabler(id)}" class="tag lc" style="--phase:${e.track.hue}">${esc(e.name)}</a>`;
}

export function author(name, role = 'Contributor') {
  return (
    `<div class="author-line"><span class="av">${esc(initials(name))}</span>` +
    `<span class="stack"><span class="an">${esc(name)}</span><span class="ar">${esc(role)}</span></span></div>`
  );
}

// ----------------------------------------------------------------- cards ----
export function useCaseCard(uc, showProblem = true) {
  const { root, leaf, key } = resolvePlace(uc);
  return (
    `<a class="uc-card p-${key}" style="--phase:${root.hue}" href="${routes.usecase(uc.id)}">` +
    `<div class="place"><span class="swatch"></span>${esc(root.name)} · ${esc(leaf.name)}` +
    when(uc.endorsed, () => `<span class="spacer"></span>${endorsed()}`) +
    `</div>` +
    `<div class="uc-title">${esc(uc.title)}</div>` +
    when(showProblem, () => `<div class="uc-problem">${esc(uc.goal)}</div>`) +
    `<div class="uc-foot">` +
    uc.techniques
      .slice(0, 2)
      .map((t) => `<span class="tag tech">${esc(DB.technique(t).name)}</span>`)
      .join('') +
    `<span class="spacer"></span><span class="author">${esc(uc.author)}</span>` +
    `</div></a>`
  );
}

export function featCard(uc, big = false) {
  const { root, leaf, key } = resolvePlace(uc);
  return (
    `<a class="feat-card p-${key}" style="--phase:${root.hue};min-height:${big ? 250 : 180}px" href="${routes.usecase(uc.id)}">` +
    `<div class="row" style="gap:8px;flex-wrap:wrap">` +
    `<span class="tag lc" style="--phase:${root.hue}">${esc(root.name)} · ${esc(leaf.name)}</span>` +
    when(uc.endorsed, () => endorsed()) +
    `</div>` +
    `<div class="f-title" style="font-size:${big ? 25 : 18}px">${esc(uc.title)}</div>` +
    when(big, () => `<div class="f-quote">${esc(uc.approach)}</div>`) +
    `<div class="spacer"></div>` +
    when(
      uc.metric,
      () =>
        `<div class="f-metric"><span class="fl">${esc(uc.metric.label)}</span>` +
        `<span class="fv" style="font-size:${big ? 22 : 18}px">${esc(uc.metric.value)}</span></div>`
    ) +
    `</a>`
  );
}

export function techChip(t) {
  return (
    `<a href="${routes.technique(t.id)}" class="${cx('tech-chip', t.endorsed && 'endorsed-chip')}">` +
    (t.endorsed ? seal(12) : `<span class="hash">#</span>`) +
    `${esc(t.name)}<span class="c">${DB.techCount(t.id)}</span></a>`
  );
}

export const techBoard = (list) => `<div class="tech-board">${list.map(techChip).join('')}</div>`;

// ------------------------------------------------------------- the spine ----
export function spineBoard() {
  return (
    `<div class="spine spine-board"><div class="spine-rail"></div>` +
    DB.phases
      .map(
        (p) =>
          `<div class="phase-col pc-${p.id}" style="--phase:${p.hue}">` +
          `<div class="phase-node"><span class="phase-dot"></span><span class="phase-num">PHASE ${esc(p.n)}</span></div>` +
          `<a class="phase-head-link" href="${routes.phase(p.id)}"><div class="phase-name">${esc(p.name)}</div></a>` +
          `<div class="phase-tag">${esc(p.tagline)}</div>` +
          `<div class="activity-list">` +
          p.subphases
            .map((s) => {
              const rows = s.activities
                .map((a) => {
                  const n = DB.ucByActivity(a.id).length;
                  const end = DB.activityEndorsed(a.id);
                  return (
                    `<a class="${cx('activity-row', n === 0 && 'empty')}" href="${routes.activity(a.id)}">` +
                    `<span class="a-name row" style="gap:7px">` +
                    when(end, () => `<span class="endorse-dot" title="Has PDLC-endorsed practice"></span>`) +
                    `${esc(a.name)}</span>` +
                    `<span class="a-count">${n || '—'}</span></a>`
                  );
                })
                .join('');
              // Implicit subphases (a flat-activities phase) carry no real label.
              return s.implicit
                ? rows
                : `<a class="subphase-head" href="${routes.subphase(p.id, s.id)}">${esc(s.name)}</a>${rows}`;
            })
            .join('') +
          `</div></div>`
      )
      .join('') +
    `</div>`
  );
}

// ------------------------------------------------------ the enabler board ---

// The enablement spine's home board — same bones as the spine board (the CSS
// is id-keyed and generated per track), tracks for phases, enablers for
// activities. No endorse dots: this spine carries no endorsements yet.
export function trackBoard() {
  const rail = DB.tracks.map((t) => t.hue).join(', ');
  return (
    `<div class="spine spine-board"><div class="spine-rail" style="background:linear-gradient(90deg, ${rail})"></div>` +
    DB.tracks
      .map(
        (t) =>
          `<div class="phase-col pc-${t.id}" style="--phase:${t.hue}">` +
          `<div class="phase-node"><span class="phase-dot"></span><span class="phase-num">TRACK ${esc(t.n)}</span></div>` +
          `<a class="phase-head-link" href="${routes.track(t.id)}"><div class="phase-name">${esc(t.name)}</div></a>` +
          `<div class="phase-tag">${esc(t.tagline)}</div>` +
          `<div class="activity-list">` +
          t.areas
            .map((ar) => {
              const rows = ar.enablers
                .map((e) => {
                  const n = DB.ucByEnabler(e.id).length;
                  return (
                    `<a class="${cx('activity-row', n === 0 && 'empty')}" href="${routes.enabler(e.id)}">` +
                    `<span class="a-name">${esc(e.name)}</span>` +
                    `<span class="a-count">${n || '—'}</span></a>`
                  );
                })
                .join('');
              // Implicit areas (a flat track — the emergent default) carry no label.
              return ar.implicit
                ? rows
                : `<a class="subphase-head" href="${routes.area(t.id, ar.id)}">${esc(ar.name)}</a>${rows}`;
            })
            .join('') +
          `</div></div>`
      )
      .join('') +
    `</div>`
  );
}

// --------------------------------------------------------- breadcrumbs ------
export function crumbs(items) {
  return (
    `<div class="crumbs">` +
    items
      .map((it, i) => {
        const sep = i > 0 ? `<span class="sep">›</span>` : '';
        const styleAttr = it.style ? ` style="${it.style}"` : '';
        const clsAttr = it.cls ? ` class="${it.cls}"` : '';
        const body = it.href
          ? `<a href="${it.href}"${clsAttr}${styleAttr}>${esc(it.label)}</a>`
          : `<span${clsAttr}${styleAttr}>${esc(it.label)}</span>`;
        return sep + body;
      })
      .join('') +
    `</div>`
  );
}

// --------------------------------------------- GitHub-issue submit flow -----

/** Deep link to the repo's new-issue form, with the scope prefilled. */
export function issueUrl({
  field = 'placement',
  value = '',
  template = 'use-case.yml',
  labels = 'use-case',
} = {}) {
  const u = new URL(`${DB.site.repoUrl}/issues/new`);
  u.searchParams.set('template', template);
  u.searchParams.set('labels', labels);
  if (value) u.searchParams.set(field, value);
  return u.toString();
}

// A contextual "+ Add …" affordance. Without JS it links straight to the
// scoped GitHub issue; with JS it opens the submit modal (see assets/js/app.js).
// Intake stays spine-agnostic: the template/labels only pick the issue form —
// placement is the editor's curation step, not the submitter's burden.
export function addLink({
  label = null,
  scopeField = 'placement',
  children,
  template = 'use-case.yml',
  labels = 'use-case',
  scope = 'phase › activity',
  verb = 'Submit a use case',
} = {}) {
  const href = issueUrl({ field: scopeField, value: label || '', template, labels });
  const title = label ? `Add to “${label}”` : verb;
  const scopeText = label || scope;
  return (
    `<a class="add-link" href="${esc(href)}" target="_blank" rel="noopener"` +
    ` data-submit data-submit-title="${esc(title)}" data-submit-scope="${esc(scopeText)}">` +
    `${gh(13)} ${esc(children || '+ Add a use case to this section')}</a>`
  );
}

// ------------------------------------------------------- header / footer ----
export function header(active = 'lifecycle') {
  const nav = [
    ['Lifecycle', routes.home(), active === 'lifecycle'],
    // The second axis appears only once the enablement spine has content.
    ...(DB.tracks && DB.tracks.length
      ? [['Enablers', routes.enablers(), active === 'enablers']]
      : []),
    ['Techniques', routes.techniques(), active === 'techniques'],
    ['About', routes.about('pdlc'), active === 'about'],
  ];
  const ctaHref = issueUrl({});
  return (
    `<header class="pb-head">` +
    `<a class="pb-brand" href="${routes.home()}"><span class="mark"></span><span>${esc(DB.site.shortTitle)}</span></a>` +
    `<nav class="pb-nav">` +
    nav.map(([label, to, act]) => `<a class="${act ? 'active' : ''}" href="${to}">${label}</a>`).join('') +
    `</nav>` +
    `<div class="pb-search" aria-hidden="true">${searchIcon}<span>Search the playbook</span></div>` +
    `<a class="pb-cta" href="${esc(ctaHref)}" target="_blank" rel="noopener" data-submit data-submit-title="Submit a use case" data-submit-scope="phase › activity">${gh(13)} Submit a use case</a>` +
    `</header>`
  );
}

export function footer() {
  return (
    `<footer class="pb-foot">` +
    `<div class="wrap-wide row">` +
    `<span>${esc(DB.site.title)} · an ${esc(DB.site.initiative)} initiative · prototype</span>` +
    `<span class="row" style="gap:18px">` +
    `<a href="${routes.about('pdlc')}">About the PDLC</a>` +
    `<a href="${routes.about('editor')}">About the editor</a>` +
    `<a href="${routes.about('initiative')}">About ${esc(DB.site.initiative)}</a>` +
    `</span></div>` +
    `<div class="wrap-wide row pb-foot-2">` +
    `<span class="kicker-mono">Project docs</span>` +
    `<span class="row" style="gap:18px">` +
    `<a href="${routes.prd()}">Master PRD</a>` +
    `<a href="${routes.ia()}">IA Proposal</a>` +
    `<a href="${routes.gallery()}">Template gallery</a>` +
    `<a href="${esc(DB.site.repoUrl)}" target="_blank" rel="noopener">GitHub repo</a>` +
    `</span></div>` +
    `</footer>`
  );
}

// The submit sheet body (also shown standalone in the template gallery).
export function submitSheet() {
  return (
    `<div class="sheet" role="dialog" aria-modal="true" aria-label="Submit a use case">` +
    `<div class="sh-head"><div>` +
    `<h3 data-modal-title>Submit a use case</h3>` +
    `<div class="sub">Contributions are GitHub issues — public, low-ceremony, easy to discuss before anything is merged.</div>` +
    `</div><button class="x" type="button" data-modal-close aria-label="Close">×</button></div>` +
    `<div class="sh-body">` +
    `<div class="gh-card">${gh(26)}<div>` +
    `<div class="t">Open an issue in the playbook repo</div>` +
    `<div class="d">Pick a template, fill in the fields below, and submit. The editor reviews, places it on the spine, and writes the editor's note.</div>` +
    `</div></div>` +
    `<div class="issue-template">` +
    `<span class="k"># New use case</span><br>` +
    `<span class="k">Title:</span> …<br>` +
    `<span class="k">Problem:</span> …<br>` +
    `<span class="k">Solution:</span> …<br>` +
    `<span class="k">Impact (optional):</span> …<br>` +
    `<span class="k">Lifecycle placement:</span> <span data-modal-scope>phase › activity</span><br>` +
    `<span class="k">Techniques used:</span> …` +
    `</div></div>` +
    `<div class="sh-foot">` +
    `<span class="gh-pill">${gh(13)} opens github.com</span><span style="flex:1"></span>` +
    `<button class="btn ghost sm" type="button" data-modal-close>Cancel</button>` +
    `<a class="btn accent sm" data-modal-primary href="${esc(issueUrl({}))}" target="_blank" rel="noopener">Open a GitHub issue</a>` +
    `</div></div>`
  );
}

// The submit modal (one per page; populated from the clicked trigger by JS).
export function submitModal() {
  return `<div class="scrim" id="submit-modal" aria-hidden="true">${submitSheet()}</div>`;
}
