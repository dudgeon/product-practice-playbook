// Page renderers. Each returns the inner <main> HTML for one route; the build
// wraps the result in the document shell (src/layout.mjs). These mirror the
// prototype's page components view-for-view.

import { esc, when } from './lib/html.mjs';
import { md } from './lib/markdown.mjs';
import { routes } from './lib/links.mjs';
import {
  seal,
  arrowR,
  endorsed,
  canon,
  editorNote,
  practiceHead,
  techTag,
  author,
  useCaseCard,
  featCard,
  techChip,
  techBoard,
  spineBoard,
  crumbs,
  addLink,
} from './components.mjs';

const pad2 = (n) => String(n).padStart(2, '0');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const ucGrid = (ucs) => `<div class="uc-grid">${ucs.map((u) => useCaseCard(u)).join('')}</div>`;

const emptyState = (title, body, link) =>
  `<div class="side-box tinted" style="border-style:dashed;text-align:center;padding:34px 24px">` +
  `<div style="font-family:var(--serif);font-size:19px;color:var(--ink-2);margin-bottom:6px">${esc(title)}</div>` +
  `<div style="font-size:13.5px;color:var(--ink-3);margin-bottom:16px">${esc(body)}</div>${link}</div>`;

// ------------------------------------------------------------------ HOME ----
export function home(db) {
  const h = db.site.home;
  const feat = db.featured();
  return (
    `<div class="fade-in"><div class="wrap-wide">` +
    `<div class="home-hero">` +
    `<div class="kicker-mono" style="margin-bottom:14px">${esc(h.kicker)}</div>` +
    `<div class="pb-h1">${esc(h.headline)}</div>` +
    `<p class="pb-lede" style="margin-top:16px;font-size:17px">${esc(h.lede)}</p>` +
    `</div>` +
    spineBoard() +
    `<div class="row" style="justify-content:flex-end;margin-top:10px">${addLink({ children: '+ Submit a use case' })}</div>` +
    // Featured strip
    `<div class="section-gap">` +
    practiceHead({
      title: h.featuredTitle,
      count: feat.length,
      right: `<span class="kicker-mono">${esc(h.featuredKicker)}</span>`,
    }) +
    `<div class="feat-row">${feat[0] ? featCard(feat[0], true) : ''}${feat.slice(1, 3).map((u) => featCard(u)).join('')}</div>` +
    `</div>` +
    // Techniques board
    `<div class="section-gap">` +
    `<div class="practice-head"><div class="ph-left">` +
    `<div class="voice-label" style="color:var(--ink-3)"><span class="vmark" style="background:var(--accent)"></span> ${esc(h.techniquesEyebrow)}</div>` +
    `<h3>${esc(h.techniquesTitle)}</h3></div>` +
    `<a href="${routes.techniques()}" class="kicker-mono" style="cursor:pointer">All techniques →</a></div>` +
    techBoard(db.techniques) +
    `<p class="kicker-mono" style="margin-top:14px;color:var(--ink-4);text-transform:none;letter-spacing:0;font-size:12px">${esc(h.techniquesCaption)}</p>` +
    `</div>` +
    `</div></div>`
  );
}

// ----------------------------------------------------------------- PHASE ----
export function phasePage(db, p) {
  const idx = db.phases.findIndex((x) => x.id === p.id);
  const next = db.phases[idx + 1];
  const prev = db.phases[idx - 1];
  const techs = db.techniquesInPhase(p.id);

  const progress = db.phases
    .map(
      (x) =>
        `<a class="pp${x.id === p.id ? ' on' : ''}" style="${x.id === p.id ? `background:${p.hue}` : ''}" href="${routes.phase(x.id)}" aria-label="Go to ${esc(x.name)}"></a>`
    )
    .join('');

  const actIndex = p.activities
    .map((a, i) => {
      const n = db.ucByActivity(a.id).length;
      const isEndorsed = db.activityEndorsed(a.id);
      return (
        `<a class="act-item" href="${routes.activity(a.id)}">` +
        `<span class="ai-n">${pad2(i + 1)}</span>` +
        `<div><div class="row" style="gap:9px"><span class="ai-name">${esc(a.name)}</span>${when(isEndorsed, () => endorsed())}</div>` +
        `<div class="ai-canon${a.canon ? '' : ' silent'}">${esc(a.canon || 'The protocol is silent here.')}</div></div>` +
        `<div class="ai-meta"><span class="ai-count">${n ? plural(n, 'use case') : 'No practice yet'}</span><span class="arrow">${arrowR()}</span></div></a>`
      );
    })
    .join('');

  return (
    `<div class="wrap-narrow fade-in" style="--phase:${p.hue}">` +
    crumbs([
      { label: 'Lifecycle', href: routes.home() },
      { label: `Phase ${p.n} · ${p.name}`, cls: 'phase', style: `color:${p.hue}` },
    ]) +
    `<div class="phase-hero">` +
    `<div class="ph-num">PHASE ${esc(p.n)} OF ${pad2(db.phases.length)}</div>` +
    `<div class="ph-title"><span class="ph-dot" style="background:${p.hue}"></span><h1 style="color:${p.hue}">${esc(p.name)}</h1></div>` +
    `<p class="pb-lede">${esc(p.tagline)}</p>` +
    `<div class="phase-progress">${progress}</div></div>` +
    canon({ text: p.canon, seal: true }) +
    `<div style="height:24px"></div>` +
    editorNote({ text: p.editor }) +
    `<div class="divider"></div>` +
    practiceHead({
      title: `Activities in ${p.name}`,
      count: p.activities.length,
      right: addLink({ label: p.name, children: '+ Add to this phase' }),
    }) +
    `<div class="act-index">${actIndex}</div>` +
    when(
      techs.length > 0,
      () =>
        `<div class="section-gap"><div class="pb-rail-label">Techniques seen across ${esc(p.name)}</div>${techBoard(techs)}</div>`
    ) +
    `<div class="divider"></div>` +
    `<div class="row" style="justify-content:space-between">` +
    (prev ? `<a href="${routes.phase(prev.id)}" class="btn ghost sm">← ${esc(prev.name)}</a>` : `<span></span>`) +
    (next ? `<a href="${routes.phase(next.id)}" class="btn ghost sm">${esc(next.name)} →</a>` : `<span></span>`) +
    `</div></div>`
  );
}

// -------------------------------------------------------------- ACTIVITY ----
export function activityPage(db, a) {
  const p = a.phase;
  const ucs = db.ucByActivity(a.id);
  const techs = db.techniquesInActivity(a.id);
  const aIdx = p.activities.findIndex((x) => x.id === a.id);

  return (
    `<div class="wrap-narrow fade-in" style="--phase:${p.hue}">` +
    crumbs([
      { label: 'Lifecycle', href: routes.home() },
      { label: p.name, href: routes.phase(p.id), cls: 'phase', style: `color:${p.hue}` },
      { label: a.name, style: 'color:var(--ink-2)' },
    ]) +
    `<div class="phase-hero" style="padding-bottom:18px">` +
    `<div class="ph-num" style="color:${p.hue}">${esc(p.name.toUpperCase())} · ACTIVITY ${pad2(aIdx + 1)}</div>` +
    `<div class="ph-title" style="margin:10px 0 12px"><h1 style="font-size:38px;color:var(--ink)">${esc(a.name)}</h1></div></div>` +
    canon({ text: a.canon, seal: !!a.canon }) +
    when(a.editor, () => `<div style="height:24px"></div>` + editorNote({ text: a.editor, compact: true })) +
    `<div class="divider"></div>` +
    practiceHead({
      title: 'What teams are doing',
      count: ucs.length,
      right: addLink({ label: `${p.name} · ${a.name}`, children: '+ Add a use case here' }),
    }) +
    (ucs.length
      ? ucGrid(ucs)
      : emptyState(
          'No practice documented yet.',
          "This activity is on the spine, but the field hasn't filled it in. Be the first.",
          addLink({ label: `${p.name} · ${a.name}`, children: '+ Add the first use case' })
        )) +
    when(
      techs.length > 0,
      () => `<div class="section-gap"><div class="pb-rail-label">Techniques used here</div>${techBoard(techs)}</div>`
    ) +
    `</div>`
  );
}

// -------------------------------------------------------------- USE CASE ----
export function usecasePage(db, u) {
  const p = db.phase(u.placement.phase);
  const act = db.activity(u.placement.activity);

  const approachExtras =
    when(
      u.prompt,
      () => `<div class="approach-sub">From the instructions</div><div class="code-snip">${esc(u.prompt)}</div>`
    ) +
    when(
      u.links && u.links.length,
      () =>
        `<div class="link-list">` +
        u.links
          .map(
            (l) =>
              `<a class="link-row" href="https://${esc(l.url)}" target="_blank" rel="noreferrer">` +
              `<span class="lr-ico">↗</span><span class="lr-label">${esc(l.label)}</span><span class="lr-url">${esc(l.url)}</span></a>`
          )
          .join('') +
        `</div>`
    );

  const side =
    when(
      u.endorsed,
      () =>
        `<div class="side-box" style="background:var(--seal-soft);border-color:var(--seal-line)">` +
        `<div class="row" style="gap:9px">${seal(18)}<strong style="font-size:13.5px;color:var(--seal-2)">PDLC-endorsed</strong></div>` +
        `<div style="font-size:12.5px;color:var(--ink-3);margin-top:8px;line-height:1.5">A reference example the protocol recommends.</div></div>`
    ) +
    `<div class="side-box"><div class="sb-label">Techniques</div><div class="wrap">${u.techniques.map(techTag).join('')}</div>` +
    `<div style="margin-top:10px;font-size:12px;color:var(--ink-3);line-height:1.5">The approach is aggregated on each technique page.</div></div>` +
    `<div class="side-box tinted"><div class="sb-label">Placed on the spine</div>` +
    `<div class="row" style="gap:9px"><span class="phase-dot" style="background:${p.hue};width:12px;height:12px;box-shadow:none"></span>` +
    `<span style="font-size:13.5px"><a href="${routes.phase(p.id)}"><strong>${esc(p.name)}</strong></a> › <a href="${routes.activity(act.id)}">${esc(act.name)}</a></span></div></div>` +
    `<div class="side-box"><div class="sb-label">Tools</div><div class="wrap">${u.tools.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>` +
    `<div class="side-box"><div class="sb-label">Contributed by</div>${author(u.author, 'Submitting team')}</div>`;

  return (
    `<div class="wrap-narrow fade-in" style="--phase:${p.hue};max-width:1080px">` +
    crumbs([
      { label: 'Lifecycle', href: routes.home() },
      { label: p.name, href: routes.phase(p.id), cls: 'phase', style: `color:${p.hue}` },
      { label: act.name, href: routes.activity(act.id) },
    ]) +
    `<div class="leaf" style="margin-top:8px">` +
    `<div class="leaf-main pcs" style="--phase:${p.hue}">` +
    `<div class="leaf-meta"><a href="${routes.phase(p.id)}" class="tag lc" style="--phase:${p.hue}">${esc(p.name)} · ${esc(act.name)}</a>` +
    u.techniques.map(techTag).join('') +
    when(u.endorsed, () => endorsed()) +
    `</div>` +
    `<div class="leaf-title">${esc(u.title)}</div>` +
    `<section><h3><span class="ix">01</span> Goal · the problem</h3>${md(u.goal)}</section>` +
    `<section><h3><span class="ix">02</span> Approach · the how</h3>${md(u.approach)}${approachExtras}</section>` +
    `<section><h3><span class="ix">03</span> Impact <span class="note-pill" style="margin-left:6px">optional</span></h3>${md(u.impact)}` +
    when(
      u.metric,
      () => `<div class="metric-box"><span class="ml">${esc(u.metric.label)}</span><span class="mv">${esc(u.metric.value)}</span></div>`
    ) +
    `</section></div>` +
    `<aside class="leaf-side">${side}</aside>` +
    `</div></div>`
  );
}

// -------------------------------------------------------------- TECHNIQUE ---
export function techniquePage(db, t) {
  const ucs = db.ucByTechnique(t.id);
  const related = db.techniques.filter((x) => x.id !== t.id).slice(0, 6);
  const phases = new Set(ucs.map((u) => u.placement.phase));

  return (
    `<div class="wrap-narrow fade-in">` +
    crumbs([
      { label: 'Techniques', href: routes.techniques() },
      { label: '#' + t.name, style: 'color:var(--accent-2)' },
    ]) +
    `<div class="tech-hero">` +
    `<div class="row" style="gap:10px"><span class="th-tag">#${esc(t.name)}</span>${when(t.endorsed, () => endorsed({ lg: true }))}</div>` +
    `<div class="pb-h1" style="font-size:36px">${esc(t.name)}</div>` +
    `<p class="pb-lede">${esc(t.description)} A horizontal technique — it shows up across the lifecycle wherever a use case applies it. Tag-based for now; related techniques will cluster into families once the patterns settle.</p>` +
    `<div class="row" style="gap:18px;margin-top:4px">` +
    `<span class="kicker-mono" style="text-transform:none;letter-spacing:0">${plural(ucs.length, 'use case')}</span>` +
    `<span class="kicker-mono" style="text-transform:none;letter-spacing:0">spans ${plural(phases.size, 'phase')}</span>` +
    `<span style="flex:1"></span>${addLink({ label: t.name, scopeField: 'techniques', children: '+ I used this — add your use case' })}` +
    `</div></div>` +
    when(t.detail, () => `<div class="tech-detail pb-prose">${md(t.detail)}</div>`) +
    `<div class="pb-rail-label">Use cases applying this technique</div>` +
    (ucs.length
      ? ucGrid(ucs)
      : emptyState(
          'A technique on the board, no use case yet.',
          'This technique is documented, but nobody has attached a use case. If you’ve applied it, add your goal and approach.',
          addLink({ label: t.name, scopeField: 'techniques', children: '+ Add the first use case' })
        )) +
    `<div class="pb-rail-label" style="margin-top:32px">Often appears with</div>` +
    techBoard(related) +
    `</div>`
  );
}

// --------------------------------------------------------- TECHNIQUES IX ----
export function techniquesIndex(db) {
  const endorsedList = db.techniques.filter((t) => t.endorsed);
  const rows = db.techniques
    .map((t) => {
      const n = db.ucByTechnique(t.id).length;
      return (
        `<a href="${routes.technique(t.id)}" class="act-item">` +
        `<span class="ai-n">${t.endorsed ? seal(14) : `<span style="color:var(--ink-4)">#</span>`}</span>` +
        `<div><div class="row" style="gap:9px"><span class="ai-name">${esc(t.name)}</span>${when(t.endorsed, () => endorsed())}</div>` +
        `<div class="ai-canon">${esc(t.description)}</div></div>` +
        `<div class="ai-meta"><span class="ai-count">${n ? plural(n, 'use case') : 'No use cases yet'}</span><span class="arrow">${arrowR()}</span></div></a>`
      );
    })
    .join('');

  return (
    `<div class="wrap-narrow fade-in">` +
    `<div class="home-hero" style="padding:40px 0 18px">` +
    `<div class="kicker-mono" style="margin-bottom:12px">The horizontal axis</div>` +
    `<div class="pb-h1" style="font-size:40px">Techniques</div>` +
    `<p class="pb-lede" style="margin-top:14px">The cross-cutting tags that gather related approaches across the lifecycle. Each page aggregates the use cases that apply it. ${endorsedList.length} are PDLC-endorsed; the rest are emergent tags that will cluster into families later.</p>` +
    `</div><div class="act-index">${rows}</div></div>`
  );
}

// ----------------------------------------------------------------- ABOUT ----
export function aboutPage(db, which) {
  const a = db.aboutPage(which);
  const items = [
    ['pdlc', 'The PDLC'],
    ['editor', 'The editor'],
    ['initiative', db.site.initiative],
  ];

  const nav = items
    .map(([k, label]) => {
      const styleAttr =
        k === which
          ? 'background:var(--ink);color:#fff;border-color:var(--ink)'
          : 'cursor:pointer';
      return `<a href="${routes.about(k)}" class="tag" style="${styleAttr}">${esc(label)}</a>`;
    })
    .join('');

  const bodyHtml = a.sections.map((s) => `<section><h2>${esc(s.heading)}</h2>${md(s.body)}</section>`).join('');

  const bodyBlock =
    which === 'editor'
      ? `<div style="display:grid;grid-template-columns:160px 1fr;gap:28px;align-items:start;margin:8px 0 12px">` +
        `<div class="placeholder-img" style="height:160px">editor portrait</div>` +
        `<div class="about-body" style="padding:0">${bodyHtml}</div></div>`
      : `<div class="about-body">${bodyHtml}</div>`;

  const keepReading = items
    .filter(([k]) => k !== which)
    .map(([k]) => `<a href="${routes.about(k)}" class="inline-link">${esc(db.aboutPage(k).title)} →</a>`)
    .join('');

  return (
    `<div class="wrap-narrow fade-in">` +
    `<div class="crumbs"><a href="${routes.home()}">Lifecycle</a><span class="sep">›</span><span>About</span></div>` +
    `<div class="row" style="gap:8px;margin-bottom:8px">${nav}</div>` +
    `<div class="about-hero">` +
    when(
      which === 'pdlc',
      () => `<div class="row" style="gap:8px;margin-bottom:14px">${seal(16)}<span class="kicker-mono" style="color:var(--seal-2)">The protocol</span></div>`
    ) +
    `<h1>${esc(a.title)}</h1><p class="lede">${esc(a.lede)}</p>` +
    when(a.draft, () => `<div style="margin-top:16px"><span class="draft-note">✎ ${esc(a.draft)}</span></div>`) +
    `</div>` +
    bodyBlock +
    when(
      which === 'pdlc',
      () =>
        `<div class="section-gap" style="margin-top:24px"><div class="pb-rail-label">The endorsement seal</div>` +
        `<div class="row" style="gap:12px;align-items:center">${endorsed({ lg: true })}` +
        `<span style="font-size:14px;color:var(--ink-2)">marks practice that has been promoted into the protocol's recommendations.</span></div></div>`
    ) +
    `<div class="divider"></div>` +
    `<div class="row" style="gap:16px;flex-wrap:wrap"><span class="kicker-mono">Keep reading:</span>${keepReading}</div>` +
    `</div>`
  );
}
