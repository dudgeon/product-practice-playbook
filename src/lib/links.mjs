// URL + route helpers.
//
// The site is rendered as real directories (one index.html per route) so it
// works as a plain static deploy. Internal links are root-relative and
// prefixed with BASE_URL, which lets the same build serve from the domain
// root locally (`/`) and from a project subpath on GitHub Pages
// (`/product-practice-playbook/`). Set BASE_URL in the environment at build
// time; it defaults to `/`.

function resolveBase() {
  let b = process.env.BASE_URL || '/';
  if (!b.startsWith('/')) b = '/' + b;
  if (!b.endsWith('/')) b += '/';
  return b;
}

export const BASE_URL = resolveBase();

/** Root-relative URL for an internal path, base-prefixed and slash-normalized. */
export function url(p = '') {
  const clean = String(p).replace(/^\/+/, '');
  return (BASE_URL + clean).replace(/\/{2,}/g, '/');
}

/** URL for a bundled asset under /assets. */
export const asset = (p = '') => url('assets/' + String(p).replace(/^\/+/, ''));

/** Named routes — the single source of truth for internal link shapes. */
export const routes = {
  home: () => url(''),
  phase: (id) => url(`phase/${id}/`),
  activity: (id) => url(`activity/${id}/`),
  usecase: (id) => url(`use-case/${id}/`),
  technique: (id) => url(`technique/${id}/`),
  techniques: () => url('techniques/'),
  about: (which) => url(`about/${which}/`),
  gallery: () => url('gallery/'),
  prd: () => url('prd/'),
  ia: () => url('ia/'),
};
