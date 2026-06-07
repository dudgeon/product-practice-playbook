// The base HTML document shell for every playbook page.

import { esc } from './lib/html.mjs';
import { asset, routes } from './lib/links.mjs';
import { header, footer, submitModal } from './components.mjs';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap';

/**
 * @param {object} opts
 * @param {string} opts.title      document <title>
 * @param {string} opts.description meta description
 * @param {string} opts.nav        active top-nav key (lifecycle|techniques|about)
 * @param {string} opts.main       inner page HTML (page provides its own .wrap-*)
 * @param {string} [opts.bodyClass] extra class on the app wrapper
 * @param {string} [opts.head]     extra <head> HTML (e.g. page-specific css link)
 */
export function layout({ title, description = '', nav = 'lifecycle', main, bodyClass = '', head = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="${asset('css/base.css')}">
<link rel="stylesheet" href="${asset('css/pb-styles.css')}">
<link rel="stylesheet" href="${asset('css/app-styles.css')}">
<link rel="stylesheet" href="${asset('css/site.css')}">
${head}
</head>
<body>
<div class="pb-app ${bodyClass}">
${header(nav)}
<main class="pb-app-main">
${main}
</main>
${footer()}
</div>
${submitModal()}
<script src="${asset('js/app.js')}" defer></script>
</body>
</html>
`;
}
