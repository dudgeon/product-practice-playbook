// Template gallery — a living reference for the design system. Every block is
// produced by the same component functions the site renders with, so it stays
// honest as the components evolve.

import {
  seal,
  gh,
  arrowR,
  endorsed,
  canon,
  editorNote,
  practiceHead,
  placeTag,
  techTag,
  author,
  useCaseCard,
  featCard,
  techChip,
  spineBoard,
  crumbs,
  addLink,
  submitSheet,
} from './components.mjs';
import { routes } from './lib/links.mjs';
import { esc } from './lib/html.mjs';

const panel = (name, note, body) =>
  `<section class="gx-block">` +
  `<div class="gx-meta"><code class="gx-name">${esc(name)}</code>${note ? `<span class="gx-note">${esc(note)}</span>` : ''}</div>` +
  `<div class="gx-stage">${body}</div></section>`;

const swatch = (token, value, use) =>
  `<div class="gx-swatch"><span class="gx-chip" style="background:${value}"></span>` +
  `<code>${esc(token)}</code><span class="gx-hex">${esc(value)}</span><span class="gx-use">${esc(use)}</span></div>`;

const group = (title, items) =>
  `<div class="gx-swgroup"><div class="gx-swtitle">${esc(title)}</div><div class="gx-swatches">${items.join('')}</div></div>`;

export function gallery(db) {
  const sampleUc = db.usecase('u-evals') || db.usecases[0];
  const featuredUc = db.featured()[0] || db.usecases[0];
  const tEndorsed = db.technique('t-evals') || db.techniques.find((t) => t.endorsed);
  const tPlain = db.technique('t-subagents') || db.techniques[0];
  const discover = db.phase('discover');

  const colors = {
    base: [
      swatch('--bg', '#f7f5f0', 'page (warm paper)'),
      swatch('--bg-elev', '#fbfaf6', 'elevated / header'),
      swatch('--bg-card', '#ffffff', 'cards'),
      swatch('--ink', '#1a1a1a', 'primary text'),
      swatch('--ink-3', '#6b6b66', 'muted text'),
      swatch('--rule', '#e6e3da', 'hairline border'),
      swatch('--accent', '#2d6a6a', 'teal accent'),
      swatch('--accent-soft', '#ecf2ef', 'accent tint'),
    ],
    phase: [
      swatch('Discover', '#2d6a6a', 'teal'),
      swatch('Discover soft', '#ecf2ef', 'tint'),
      swatch('Build', '#4a5a8a', 'indigo'),
      swatch('Build soft', '#e7e9f1', 'tint'),
      swatch('Grow', '#3a7a4a', 'green'),
      swatch('Grow soft', '#e3ede1', 'tint'),
    ],
    seal: [
      swatch('--seal', '#9a7b3f', 'seal / endorse'),
      swatch('--seal-2', '#7c6231', 'endorsed text'),
      swatch('--seal-soft', '#f3ecdb', 'endorsed pill bg'),
      swatch('--seal-line', '#e4d7b6', 'endorsed border'),
      swatch('--canon-bg', '#faf7ef', 'canon block bg'),
    ],
  };

  const typeSpecimens =
    `<div class="gx-type"><span class="gx-tlabel">Serif · Newsreader — hero</span><div style="font-family:var(--serif);font-weight:500;font-size:46px;letter-spacing:-.02em;line-height:1.05">Where in the work does AI help?</div></div>` +
    `<div class="gx-type"><span class="gx-tlabel">Serif — leaf / detail title</span><div style="font-family:var(--serif);font-weight:500;font-size:34px;letter-spacing:-.02em">A calibrated second pair of eyes</div></div>` +
    `<div class="gx-type"><span class="gx-tlabel">Serif — canon (19px)</span><div style="font-family:var(--serif);font-size:19px;line-height:1.45">Every step produces a reviewable artifact.</div></div>` +
    `<div class="gx-type"><span class="gx-tlabel">Sans · IBM Plex Sans — body 15–16px</span><div style="font-size:15.5px;line-height:1.62;max-width:60ch;color:var(--ink-2)">The bulk of the library is practice: what teams are actually doing, in cards you can read and fork.</div></div>` +
    `<div class="gx-type"><span class="gx-tlabel">Mono · IBM Plex Mono — eyebrow / label</span><div class="kicker-mono">An AI in Product initiative</div></div>`;

  const richNote = {
    lead: 'Discovery is where AI has changed the most, and the fastest — and where it’s easiest to fool yourself.',
    body: 'The cost of synthesis has collapsed. The bottleneck is no longer gathering, it’s trust.',
    points: [
      '**Make every model claim traceable to a source** — a transcript timecode, a quote, a link.',
      '**Keep a human naming the problem.** That’s the one thing Discover can’t outsource.',
    ],
  };

  return (
    `<div class="wrap-wide fade-in">` +
    crumbs([
      { label: 'Playbook', href: routes.home() },
      { label: 'Template gallery', style: 'color:var(--ink-2)' },
    ]) +
    `<div class="home-hero" style="padding:32px 0 8px">` +
    `<div class="kicker-mono" style="margin-bottom:12px">Design system · component reference</div>` +
    `<div class="pb-h1" style="font-size:44px">Template gallery</div>` +
    `<p class="pb-lede" style="margin-top:14px">Every reusable template/component the static build renders with, shown in isolation. These are produced by the same functions in <code>src/components.mjs</code> that build the playbook — use this page to reference the vocabulary and verify the design tokens.</p>` +
    `</div>` +

    // Tokens
    `<h2 class="gx-h2">Color tokens</h2>` +
    panel('design tokens', 'CSS custom properties in base.css / app-styles.css',
      group('Base palette', colors.base) + group('Phase hues (lifecycle wayfinding)', colors.phase) + group('Endorsement / official (brass)', colors.seal)) +

    `<h2 class="gx-h2">Type scale</h2>` +
    panel('typography', 'Newsreader · IBM Plex Sans · IBM Plex Mono', typeSpecimens) +

    // The three voices
    `<h2 class="gx-h2">The three voices</h2>` +
    panel('canon({ text, seal })', 'What the PDLC says — brass / official', canon({ text: 'Every step produces a reviewable artifact. Decisions are recorded with their rationale. Quality gates precede release.', seal: true })) +
    panel('canon({})', 'The silent state — emptiness as a feature', canon({})) +
    panel('editorNote({ text })', 'Rich form — the section intro on phase pages', editorNote({ text: richNote })) +
    panel('editorNote({ text, compact: true })', 'Compact one-liner — activity pages', editorNote({ text: 'The highest-leverage place to point an agent in the whole lifecycle.', compact: true })) +
    panel('practiceHead({ title, count })', 'Section header above field contributions', practiceHead({ title: 'What teams are doing', count: 4, right: addLink({ label: 'Discover · Customer research', children: '+ Add a use case here' }) })) +

    // Endorsement
    `<h2 class="gx-h2">Endorsement</h2>` +
    panel('seal(size)', 'ring + checkmark — not a brand mark', `<span style="color:var(--seal);display:inline-flex;gap:14px;align-items:center">${seal(16)}${seal(24)}${seal(40)}</span>`) +
    panel('endorsed({ lg })', 'the brass PDLC-endorsed pill', `<span style="display:inline-flex;gap:14px;align-items:center">${endorsed()} ${endorsed({ lg: true })}</span>`) +

    // Tags
    `<h2 class="gx-h2">Tags &amp; chips</h2>` +
    panel('placeTag(uc, withActivity)', 'lifecycle placement — colored by phase',
      `<span class="wrap">${placeTag({ placement: { phase: 'discover', activity: 'd-research' } }, true)}${placeTag({ placement: { phase: 'build', activity: 'b-review' } }, true)}${placeTag({ placement: { phase: 'grow', activity: 'g-ops' } }, true)}</span>`) +
    panel('techTag(id)', 'a technique reference tag', `<span class="wrap">${db.techniques.slice(0, 5).map((t) => techTag(t.id)).join('')}</span>`) +
    panel('techChip(t)', 'technique board chip — endorsed ones seal-marked', `<div class="tech-board">${techChip(tEndorsed)}${techChip(tPlain)}</div>`) +

    // Buttons
    `<h2 class="gx-h2">Buttons &amp; affordances</h2>` +
    panel('.btn variants', 'base / accent / ghost (from base.css)', `<span class="row" style="gap:10px;flex-wrap:wrap"><button class="btn">Primary</button><button class="btn accent">Accent</button><button class="btn ghost">Ghost</button><button class="btn ghost sm">Ghost · sm</button></span>`) +
    panel('addLink({ label, children })', 'contextual GitHub-issue submit affordance', addLink({ label: 'Build · Engineering', children: '+ Add a use case here' })) +

    // Cards
    `<h2 class="gx-h2">Cards</h2>` +
    panel('useCaseCard(uc)', 'the workhorse practice card', `<div style="max-width:360px">${useCaseCard(sampleUc)}</div>`) +
    panel('featCard(uc, big)', 'featured strip — big + standard', `<div class="feat-row">${featCard(featuredUc, true)}${featCard(db.featured()[1] || sampleUc)}</div>`) +
    panel('metric-box', 'phase-hued headline metric', `<div style="--phase:${discover.hue}"><div class="metric-box"><span class="ml">Time saved</span><span class="mv">52 hrs/week</span></div></div>`) +
    panel('author(name, role)', 'contributor byline', author('Northstar Squad', 'Submitting team')) +

    // Spine
    `<h2 class="gx-h2">The spine</h2>` +
    panel('spineBoard()', 'the interactive home board — primary navigation', spineBoard()) +

    // Submit
    `<h2 class="gx-h2">Submit flow</h2>` +
    panel('submitSheet()', 'GitHub-issue modal body (shown inline here)', `<div class="gx-sheet-stage">${submitSheet()}</div>`) +

    // Misc
    `<h2 class="gx-h2">Detail building blocks</h2>` +
    panel('code-snip', 'prompt / instruction block', `<div class="code-snip"># pass 1 — classify each message standalone\nfor msg in messages:\n    label = classify(msg)   # signal | noise | escalate</div>`) +
    panel('link-list', 'resource links inside an approach', `<div class="link-list"><a class="link-row" href="#"><span class="lr-ico">↗</span><span class="lr-label">support-triage skill</span><span class="lr-url">github.com/example/support-triage</span></a><a class="link-row" href="#"><span class="lr-ico">↗</span><span class="lr-label">Internal launch memo</span><span class="lr-url">example.com/memo</span></a></div>`) +
    panel('side-box', 'sidebar panel (plain + tinted)', `<div style="display:flex;gap:16px;flex-wrap:wrap"><div class="side-box" style="min-width:220px"><div class="sb-label">Tools</div><div class="wrap"><span class="tag">Claude Code</span><span class="tag">Slack</span><span class="tag">MCP</span></div></div><div class="side-box tinted" style="min-width:220px"><div class="sb-label">Placed on the spine</div><div class="row" style="gap:9px"><span class="phase-dot" style="background:${discover.hue};width:12px;height:12px;box-shadow:none"></span><span style="font-size:13.5px"><strong>Discover</strong> › Customer research</span></div></div></div>`) +
    panel('empty state + draft-note', 'confident emptiness + draft marker',
      `<div class="side-box tinted" style="border-style:dashed;text-align:center;padding:28px 22px;max-width:420px"><div style="font-family:var(--serif);font-size:19px;color:var(--ink-2);margin-bottom:6px">No practice documented yet.</div><div style="font-size:13.5px;color:var(--ink-3);margin-bottom:16px">This activity is on the spine, but the field hasn’t filled it in.</div>${addLink({ label: 'Discover · Prioritization', children: '+ Add the first use case' })}</div><div style="margin-top:14px"><span class="draft-note">✎ Draft — replace with the real copy.</span></div>`) +

    `</div>`
  );
}
