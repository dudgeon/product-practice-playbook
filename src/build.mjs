// Static-site build. Reads the content store, renders every route through the
// templates/components, and writes a deployable dist/ tree. Also assembles the
// ancillary doc pages (Master PRD, IA Proposal) by wrapping the design's
// self-contained HTML with a thin cross-nav banner.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadContent } from './lib/content.mjs';
import { asset, routes, BASE_URL } from './lib/links.mjs';
import { bindData } from './components.mjs';
import { layout } from './layout.mjs';
import {
  home,
  phasePage,
  activityPage,
  usecasePage,
  techniquePage,
  techniquesIndex,
  aboutPage,
} from './pages.mjs';
import { gallery } from './gallery.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'content');

let pageCount = 0;
function emit(relPath, html) {
  const outDir = relPath ? path.join(DIST, relPath) : DIST;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  pageCount += 1;
}

function emitFile(relFile, html) {
  const abs = path.join(DIST, relFile);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, html);
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
  const raw = fs.readFileSync(path.join(CONTENT, 'pages', srcFile), 'utf8');
  const withBanner = raw.replace(/<body[^>]*>/i, (m) => m + '\n' + docBanner(current));
  emit(relPath, withBanner);
}

function build() {
  const db = loadContent();
  bindData(db);

  // Reset output
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // ---- Playbook routes (rendered from content + templates) ----
  emit('', layout({
    title: `${db.site.title} — ${db.site.home.headline}`,
    description: db.site.tagline,
    nav: 'lifecycle',
    main: home(db),
  }));

  for (const p of db.phases) {
    emit(`phase/${p.id}`, layout({
      title: `${p.name} · ${db.site.title}`,
      description: p.tagline,
      nav: 'lifecycle',
      main: phasePage(db, p),
    }));
    for (const a of p.activities) {
      const act = db.activity(a.id);
      emit(`activity/${a.id}`, layout({
        title: `${a.name} · ${p.name} · ${db.site.title}`,
        description: a.canon || `${a.name} — ${p.name}.`,
        nav: 'lifecycle',
        main: activityPage(db, act),
      }));
    }
  }

  for (const u of db.usecases) {
    const p = db.phase(u.placement.phase);
    emit(`use-case/${u.id}`, layout({
      title: `${u.title} · ${db.site.title}`,
      description: u.goal,
      nav: 'lifecycle',
      main: usecasePage(db, u),
    }));
  }

  emit('techniques', layout({
    title: `Techniques · ${db.site.title}`,
    description: 'The cross-cutting techniques that gather related approaches across the lifecycle.',
    nav: 'techniques',
    main: techniquesIndex(db),
  }));
  for (const t of db.techniques) {
    emit(`technique/${t.id}`, layout({
      title: `#${t.name} · ${db.site.title}`,
      description: t.description,
      nav: 'techniques',
      main: techniquePage(db, t),
    }));
  }

  for (const a of db.about) {
    emit(`about/${a.which}`, layout({
      title: `${a.title} · ${db.site.title}`,
      description: a.lede,
      nav: 'about',
      main: aboutPage(db, a.which),
    }));
  }

  // ---- Template gallery ----
  emit('gallery', layout({
    title: `Template gallery · ${db.site.title}`,
    description: 'Component reference for the AI PDLC Playbook design system.',
    nav: 'gallery',
    head: `<link rel="stylesheet" href="${asset('css/gallery.css')}">`,
    main: gallery(db),
  }));

  // ---- 404 ----
  emitFile('404.html', layout({
    title: `Not found · ${db.site.title}`,
    description: 'Page not found.',
    nav: 'lifecycle',
    main:
      `<div class="wrap-narrow fade-in" style="padding:80px 0;text-align:center">` +
      `<div class="pb-h1" style="font-size:42px">Off the spine</div>` +
      `<p class="pb-lede" style="margin:14px auto 24px">That page isn’t on the lifecycle. Head back to the playbook and start at a phase.</p>` +
      `<a class="btn accent" href="${routes.home()}">← Back to the playbook</a></div>`,
  }));

  // ---- Ancillary docs (design's self-contained HTML + nav banner) ----
  emitDoc('master-prd.html', 'prd', 'prd');
  emitDoc('ia-proposal.html', 'ia', 'ia');

  // ---- Assets ----
  fs.cpSync(path.join(ROOT, 'src', 'assets'), path.join(DIST, 'assets'), { recursive: true });

  // GitHub Pages: skip Jekyll processing.
  emitFile('.nojekyll', '');

  console.log(`Built ${pageCount} pages → dist/  (base "${BASE_URL}")`);
}

build();
