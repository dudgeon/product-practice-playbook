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
// no text is supplied.
export function canon({ text, seal: withSeal = false } = {}) {
  const silent = !text;
  return (
    `<div class="canon">` +
    `<div class="voice-label"><span class="vmark"></span> What the PDLC says</div>` +
    when(withSeal, () => `<span class="canon-seal">${seal(12)} Protocol</span>`) +
    `<div class="${cx('canon-text', silent && 'silent')}">` +
    (silent ? 'The protocol is silent here — this activity is yours to define.' : esc(text)) +
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
export function placeTag(uc, withActivity = false) {
  const ph = DB.phase(uc.placement.phase);
  const act = DB.activity(uc.placement.activity);
  const label = ph.name + (withActivity && act ? ' · ' + act.name : '');
  return `<a href="${routes.phase(ph.id)}" class="tag lc" style="--phase:${ph.hue}">${esc(label)}</a>`;
}

export function techTag(id) {
  const t = DB.technique(id);
  if (!t) return '';
  return `<a href="${routes.technique(id)}" class="tag tech">${esc(t.name)}</a>`;
}

export function author(name, role = 'Contributor') {
  return (
    `<div class="author-line"><span class="av">${esc(initials(name))}</span>` +
    `<span class="stack"><span class="an">${esc(name)}</span><span class="ar">${esc(role)}</span></span></div>`
  );
}

// ----------------------------------------------------------------- cards ----
export function useCaseCard(uc, showProblem = true) {
  const ph = DB.phase(uc.placement.phase);
  const act = DB.activity(uc.placement.activity);
  return (
    `<a class="uc-card p-${uc.placement.phase}" style="--phase:${ph.hue}" href="${routes.usecase(uc.id)}">` +
    `<div class="place"><span class="swatch"></span>${esc(ph.name)} · ${esc(act.name)}` +
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
  const ph = DB.phase(uc.placement.phase);
  const act = DB.activity(uc.placement.activity);
  return (
    `<a class="feat-card p-${uc.placement.phase}" style="--phase:${ph.hue};min-height:${big ? 250 : 180}px" href="${routes.usecase(uc.id)}">` +
    `<div class="row" style="gap:8px;flex-wrap:wrap">` +
    `<span class="tag lc" style="--phase:${ph.hue}">${esc(ph.name)} · ${esc(act.name)}</span>` +
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
export function issueUrl({ field = 'placement', value = '' } = {}) {
  const u = new URL(`${DB.site.repoUrl}/issues/new`);
  u.searchParams.set('template', 'use-case.yml');
  u.searchParams.set('labels', 'use-case');
  if (value) u.searchParams.set(field, value);
  return u.toString();
}

// A contextual "+ Add …" affordance. Without JS it links straight to the
// scoped GitHub issue; with JS it opens the submit modal (see assets/js/app.js).
export function addLink({ label = null, scopeField = 'placement', children } = {}) {
  const href = issueUrl({ field: scopeField, value: label || '' });
  const title = label ? `Add to “${label}”` : 'Submit a use case';
  const scope = label || 'phase › activity';
  return (
    `<a class="add-link" href="${esc(href)}" target="_blank" rel="noopener"` +
    ` data-submit data-submit-title="${esc(title)}" data-submit-scope="${esc(scope)}">` +
    `${gh(13)} ${esc(children || '+ Add a use case to this section')}</a>`
  );
}

// ------------------------------------------------------- header / footer ----
export function header(active = 'lifecycle') {
  const nav = [
    ['Lifecycle', routes.home(), active === 'lifecycle'],
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
