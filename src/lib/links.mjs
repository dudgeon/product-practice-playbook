// URL + route helpers — fully relative, so the build is portable.
//
// Every internal link is computed relative to the page being rendered and
// points at an explicit index.html file. That means the exact same dist/ works
// in all of:
//   • GitHub Pages under a project subpath (/product-practice-playbook/…)
//   • any local static server (npm run serve)
//   • opening dist/index.html straight off disk via file://
// No base path / configuration required.

import path from 'node:path';

// Site-root-relative directory of the page currently being rendered
// (no leading/trailing slash; '' for the home page). Set per page by the build.
let currentDir = '';
export function setCurrentDir(dir = '') {
  currentDir = String(dir).replace(/^\/+|\/+$/g, '');
}

// Canonical site-root-relative target FILES (every route is a dir + index.html).
const TARGET = {
  home: 'index.html',
  phase: (id) => `phase/${id}/index.html`,
  activity: (id) => `activity/${id}/index.html`,
  usecase: (id) => `use-case/${id}/index.html`,
  technique: (id) => `technique/${id}/index.html`,
  techniques: 'techniques/index.html',
  enablers: 'enablers/index.html',
  track: (id) => `track/${id}/index.html`,
  enabler: (id) => `enabler/${id}/index.html`,
  about: (which) => `about/${which}/index.html`,
  gallery: 'gallery/index.html',
  prd: 'prd/index.html',
  ia: 'ia/index.html',
};

/** Relative URL from the current page's directory to a site-root-relative file. */
export function rel(targetFile) {
  const from = '/' + currentDir; // current page directory, rooted
  const to = '/' + String(targetFile).replace(/^\/+/, '');
  return path.posix.relative(from, to) || 'index.html';
}

/** Relative URL for a bundled asset under /assets. */
export const asset = (p = '') => rel('assets/' + String(p).replace(/^\/+/, ''));

/** Named routes — relative to whichever page is being rendered. */
export const routes = {
  home: () => rel(TARGET.home),
  phase: (id) => rel(TARGET.phase(id)),
  // Subphases aren't standalone pages — they're deep-linkable anchored sections
  // on their phase page (e.g. phase/discover/#understand).
  subphase: (phaseId, subId) => `${rel(TARGET.phase(phaseId))}#${subId}`,
  activity: (id) => rel(TARGET.activity(id)),
  usecase: (id) => rel(TARGET.usecase(id)),
  technique: (id) => rel(TARGET.technique(id)),
  techniques: () => rel(TARGET.techniques),
  enablers: () => rel(TARGET.enablers),
  track: (id) => rel(TARGET.track(id)),
  // Areas mirror subphases: not standalone pages, but deep-linkable anchored
  // sections on their track page (e.g. track/data/#describe).
  area: (trackId, areaId) => `${rel(TARGET.track(trackId))}#${areaId}`,
  enabler: (id) => rel(TARGET.enabler(id)),
  about: (which) => rel(TARGET.about(which)),
  gallery: () => rel(TARGET.gallery),
  prd: () => rel(TARGET.prd),
  ia: () => rel(TARGET.ia),
};
