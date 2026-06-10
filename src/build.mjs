// Static-site build. Reads the content store, renders every route through the
// templates/components, and writes a deployable dist/ tree with fully relative
// links (portable across GitHub Pages, any local server, and file://). Also
// assembles the ancillary doc pages (Master PRD, IA Proposal) by wrapping the
// design's self-contained HTML with a thin cross-nav banner.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadContent } from './lib/content.mjs';
import { routes, asset, setCurrentDir } from './lib/links.mjs';
import { bindData } from './components.mjs';
import { layout } from './layout.mjs';
import {
  home,
  phasePage,
  activityPage,
  enablersIndex,
  trackPage,
  enablerPage,
  usecasePage,
  techniquePage,
  techniquesIndex,
  aboutPage,
} from './pages.mjs';
import { gallery } from './gallery.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'content');

const PROD_HOME = 'https://dudgeon.org/product-practice-playbook/';

let pageCount = 0;
function emit(relPath, html) {
  const outDir = relPath ? path.join(DIST, relPath) : DIST;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  pageCount += 1;
}

// Render one playbook route: bind the page directory (for relative links),
// build the inner HTML, then wrap it in the document shell.
function render(relPath, { mainFn, headFn, ...opts }) {
  setCurrentDir(relPath);
  const head = headFn ? headFn() : opts.head || '';
  const main = mainFn();
  emit(relPath, layout({ ...opts, head, main }));
}

// Thin banner injected into the ancillary doc pages so readers can navigate
// back to the playbook and between the project docs.
function docBanner(current) {
  const link = (href, label, isCurrent) =>
    `<a href="${href}" style="color:${isCurrent ? '#1a1a1a' : '#6b6b66'};text-decoration:none;font-weight:${isCurrent ? 600 : 400};padding:4px 2px">${label}</a>`;
  return (
    `<div style="position:sticky;top:0;z-index:999;display:flex;align-items:center;gap:22px;flex-wrap:wrap;` +
    `padding:10px 24px;background:#fbfaf6;border-bottom:1px solid #e6e3da;` +
    `font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.02em">` +
    `<a href="${routes.home()}" style="color:#1a1a1a;text-decoration:none;font-weight:600">← AI PDLC Playbook</a>` +
    `<span style="flex:1"></span>` +
    link(routes.prd(), 'Master PRD', current === 'prd') +
    link(routes.ia(), 'IA Proposal', current === 'ia') +
    link(routes.gallery(), 'Template gallery', false) +
    link('https://github.com/dudgeon/product-practice-playbook', 'GitHub', false) +
    `</div>`
  );
}

function emitDoc(srcFile, relPath, current) {
  setCurrentDir(relPath);
  const raw = fs.readFileSync(path.join(CONTENT, 'pages', srcFile), 'utf8');
  const withBanner = raw.replace(/<body[^>]*>/i, (m) => m + '\n' + docBanner(current));
  emit(relPath, withBanner);
}

// Standalone 404 — kept self-contained (inline styles, no relative asset deps)
// because GitHub Pages serves it for arbitrary deep paths.
function notFoundPage(site) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found · ${site.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;height:100%}
  body{background:#f7f5f0;color:#1a1a1a;font-family:'IBM Plex Mono',ui-monospace,monospace;
    display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
  h1{font-family:'Newsreader',Georgia,serif;font-weight:500;font-size:46px;letter-spacing:-.02em;margin:0 0 14px}
  p{color:#3a3a3a;max-width:46ch;margin:0 auto 24px;line-height:1.6;font-size:13.5px}
  a{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:6px;
    background:#2d6a6a;color:#fff;text-decoration:none;font-size:13px}
</style></head>
<body><div>
  <h1>Off the spine</h1>
  <p>That page isn’t on the lifecycle. Head back to the playbook and start at a phase.</p>
  <a href="${PROD_HOME}">← Back to the playbook</a>
</div></body></html>
`;
}

// Spine-keyed CSS derived from the lifecycle + enablement taxonomies so
// adding/renaming/recoloring a stage or track Just Works: hue tokens, the
// featured-card soft gradient, the --phase var per root, and the home spine
// rail gradient across the lifecycle phases (the enabler board inlines its
// own rail from track hues).
function spineCss(phases, tracks = []) {
  const roots = [...phases, ...tracks];
  const tokens = roots.map((p) => `  --${p.id}: ${p.hue}; --${p.id}-soft: ${p.soft};`).join('\n');
  const rules = roots
    .map(
      (p) =>
        `.phase-col.pc-${p.id}, .uc-card.p-${p.id}, .feat-card.p-${p.id} { --phase: var(--${p.id}); }\n` +
        `.feat-card.p-${p.id} { background: linear-gradient(160deg, var(--${p.id}-soft), var(--bg-card) 65%); border-color: color-mix(in oklab, var(--${p.id}) 18%, var(--rule)); }`
    )
    .join('\n');
  const rail = `.spine-rail { background: linear-gradient(90deg, ${phases.map((p) => p.hue).join(', ')}); }`;
  return `/* Generated from content/lifecycle.json + content/enablers.json by the build — do not edit. */\n:root {\n${tokens}\n}\n${rules}\n${rail}\n`;
}

function build() {
  const db = loadContent();
  bindData(db);

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // ---- Playbook routes (rendered from content + templates) ----
  render('', {
    title: `${db.site.title} — ${db.site.home.headline}`,
    description: db.site.tagline,
    nav: 'lifecycle',
    mainFn: () => home(db),
  });

  for (const p of db.phases) {
    render(`phase/${p.id}`, {
      title: `${p.name} · ${db.site.title}`,
      description: p.tagline,
      nav: 'lifecycle',
      mainFn: () => phasePage(db, p),
    });
    for (const a of p.activities) {
      render(`activity/${a.id}`, {
        title: `${a.name} · ${p.name} · ${db.site.title}`,
        description: a.canon || `${a.name} — ${p.name}.`,
        nav: 'lifecycle',
        mainFn: () => activityPage(db, db.activity(a.id)),
      });
    }
  }

  // ---- The enablement spine (the second axis) ----
  if (db.tracks.length) {
    render('enablers', {
      title: `Enablers · ${db.site.title}`,
      description:
        'The second axis — what platform, process, data, and product owners owe the org so agents get traction.',
      nav: 'enablers',
      mainFn: () => enablersIndex(db),
    });
    for (const t of db.tracks) {
      render(`track/${t.id}`, {
        title: `${t.name} · ${db.site.title}`,
        description: t.tagline,
        nav: 'enablers',
        mainFn: () => trackPage(db, t),
      });
      for (const e of t.enablers) {
        render(`enabler/${e.id}`, {
          title: `${e.name} · ${t.name} · ${db.site.title}`,
          description: e.canon || `${e.name} — ${t.name}.`,
          nav: 'enablers',
          mainFn: () => enablerPage(db, db.enabler(e.id)),
        });
      }
    }
  }

  for (const u of db.usecases) {
    render(`use-case/${u.id}`, {
      title: `${u.title} · ${db.site.title}`,
      description: u.goal,
      nav: u.placement.track ? 'enablers' : 'lifecycle',
      mainFn: () => usecasePage(db, u),
    });
  }

  render('techniques', {
    title: `Techniques · ${db.site.title}`,
    description: 'The cross-cutting techniques that gather related approaches across the lifecycle.',
    nav: 'techniques',
    mainFn: () => techniquesIndex(db),
  });
  for (const t of db.techniques) {
    render(`technique/${t.id}`, {
      title: `#${t.name} · ${db.site.title}`,
      description: t.description,
      nav: 'techniques',
      mainFn: () => techniquePage(db, t),
    });
  }

  for (const a of db.about) {
    render(`about/${a.which}`, {
      title: `${a.title} · ${db.site.title}`,
      description: a.lede,
      nav: 'about',
      mainFn: () => aboutPage(db, a.which),
    });
  }

  // ---- Template gallery ----
  render('gallery', {
    title: `Template gallery · ${db.site.title}`,
    description: 'Component reference for the AI PDLC Playbook design system.',
    nav: 'gallery',
    headFn: () => `<link rel="stylesheet" href="${asset('css/gallery.css')}">`,
    mainFn: () => gallery(db),
  });

  // ---- Ancillary docs (design's self-contained HTML + nav banner) ----
  emitDoc('master-prd.html', 'prd', 'prd');
  emitDoc('ia-proposal.html', 'ia', 'ia');

  // ---- 404 + Pages housekeeping ----
  fs.writeFileSync(path.join(DIST, '404.html'), notFoundPage(db.site));
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

  // ---- Assets ----
  fs.cpSync(path.join(ROOT, 'src', 'assets'), path.join(DIST, 'assets'), { recursive: true });
  // Spine-keyed CSS derived from both taxonomies (written after the static copy).
  fs.writeFileSync(path.join(DIST, 'assets', 'css', 'lifecycle.css'), spineCss(db.phases, db.tracks));

  console.log(`Built ${pageCount} pages → dist/ (relative links; portable)`);
}

build();
