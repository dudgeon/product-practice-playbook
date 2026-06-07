# AI PDLC Playbook

A curated, lightly‑opinionated library of AI‑augmented product craft, organized
along a fixed **Product Development Lifecycle** (Discover → Build → Grow). The
lifecycle is the spine; three editorial voices — **Canon** (what the protocol
says), the **Editor's note**, and **Practice** (what teams actually do) — layer
over it.

Built from a [Claude Design](https://claude.ai/design) handoff as a **static
site**: all content lives in JSON + Markdown, and reusable templates/components
render it into static HTML at build time.

## 🔗 Live pages

| Page | What it is | Link |
|---|---|---|
| **Playbook prototype** | The interactive site — the spine, phases, activities, use cases, techniques, About | https://dudgeon.org/product-practice-playbook/ |
| **Master PRD** | The product requirements doc (final two‑entity model) | https://dudgeon.org/product-practice-playbook/prd/ |
| **IA Proposal** | The information‑architecture proposal & open decisions | https://dudgeon.org/product-practice-playbook/ia/ |
| **Template gallery** | Component/design‑system reference | https://dudgeon.org/product-practice-playbook/gallery/ |

> Published via GitHub Actions to GitHub Pages (custom domain `dudgeon.org`). The
> `dudgeon.github.io/product-practice-playbook/` URL redirects here.

## What's here

- **Two entities, two browse axes.** A **use case** sits on the lifecycle
  (Goal → Approach → Impact, where the approach = instructions + an optional
  prompt + optional resource links). A **technique** is a cross‑cutting tag with
  one aggregation page. There is no standalone "Resource" entity. Top nav:
  **Lifecycle · Techniques · About**.
- **The three voices**, kept unmistakably distinct by labeling + treatment — no
  literal on‑screen legend.
- **Endorsement.** Proven practice can be promoted into the protocol's
  recommendations with a brass *PDLC‑endorsed* seal.
- **Contribution via GitHub issues.** The header CTA and every contextual
  "+ Add" link deep‑link to a scoped [issue template](.github/ISSUE_TEMPLATE).

## How it's built

A small zero‑framework static‑site generator (plain Node ESM):

```
content/                 ← the source of truth (edit these)
  site.json                site config + home copy
  phases.json              the spine: phases, activities, canon, editor notes
  techniques.json          the horizontal technique tags
  usecases/*.md            one use case per file: YAML frontmatter + prose
  about/*.md               the three About pages
  pages/*.html             self-contained ancillary docs (Master PRD, IA Proposal)
src/
  lib/                     content loader, markdown, links, html helpers
  components.mjs           the design system as reusable template functions
  pages.mjs                page renderers (home, phase, activity, use case, …)
  gallery.mjs              the template gallery
  layout.mjs               the document shell
  build.mjs                the build: content + templates → dist/
  assets/                  css (base + the design's stylesheets) + the tiny modal js
scripts/
  bootstrap-content.mjs    one-time: derived content/ from the design's data module
  serve.mjs                zero-dep local preview server
design-reference/          the original design handoff (provenance, not built)
```

At build time the loader reads `content/`, the components/pages turn it into
HTML, and everything is written to `dist/` as real directories (one
`index.html` per route) so it deploys anywhere. The **template gallery** renders
straight from `src/components.mjs`, so it stays an honest reference.

## Run it locally

Clone/download the repo, then:

```bash
npm install
npm run dev        # build + serve at http://localhost:8080
```

Or step by step — `npm run build` (→ `dist/`) then `npm run serve`. All internal
links are **relative**, so the built `dist/` is fully portable: it works on
GitHub Pages under the project subpath, behind any local static server, **and**
opened straight off disk — you can double‑click `dist/index.html` and click
through the whole site over `file://`, no server required.

**Editing content** — change the files under `content/` and rebuild. Use cases
are Markdown with frontmatter:

```markdown
---
id: u-example
title: A short, specific title
phase: build
activity: b-review
featured: false
endorsed: false
techniques: [t-subagents, t-evals]
tools: [Claude Code, GitHub]
author: Your Team
metric: { label: "Review time", value: "−50%" }
---
## Goal
The problem, for whom, and what it cost.

## Approach
The how — instructions, and optionally a prompt block and resource links.

## Impact
What changed (optional).
```

## Deployment

GitHub Actions builds and publishes to **GitHub Pages** on every push to `main`
(see [`.github/workflows/pages.yml`](.github/workflows/pages.yml)). Pages source
is set to **GitHub Actions**; the site serves from the custom domain `dudgeon.org`.
Because links are relative, no base‑path configuration is needed. Pull requests
run the build as a check but do not deploy.

## Credits

Design and product direction from the *AI in Product* initiative; recreated
faithfully from the Claude Design handoff bundle (see `design-reference/`).
Content (canon lines, editor's notes, bios) is first‑draft placeholder copy for
the editor to replace.
