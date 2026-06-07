// Markdown rendering. Prose lives in the content Markdown files; this turns it
// into HTML at build time. `renderBold` mirrors the prototype's tiny inline
// **bold** helper used inside editor-note bullet points.

import { marked } from 'marked';
import { esc } from './html.mjs';

marked.use({ gfm: true, breaks: false });

/** Render a Markdown block to HTML. */
export const md = (s = '') => marked.parse(String(s)).trim();

/** Render a single line of Markdown (no wrapping <p>). */
export const mdInline = (s = '') => marked.parseInline(String(s)).trim();

/** Escape, then promote **bold** spans — for short, trusted editorial strings. */
export const renderBold = (s = '') =>
  esc(String(s)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
