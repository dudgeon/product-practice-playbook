// Tiny HTML string helpers. Templates build markup with tagged template
// literals and these escapers — there is no virtual DOM, just strings.

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text for safe interpolation into HTML body or attributes. */
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** Join class names, dropping falsy values. Accepts strings or arrays. */
export const cx = (...xs) => xs.flat().filter(Boolean).join(' ');

/** Build a `style="..."` value from an object of CSS declarations. */
export const style = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

/** Join an array of HTML fragments. */
export const join = (xs = []) => xs.filter((x) => x != null && x !== false).join('');

/** Conditional fragment helper: when(cond, () => html). */
export const when = (cond, fn) => (cond ? (typeof fn === 'function' ? fn() : fn) : '');
