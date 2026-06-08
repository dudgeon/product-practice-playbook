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
  lifecycle.json           the spine SKELETON: phases → subphases → key activities (ids, names, order, hue, tagline)
  phases/*.md              per-phase editorial prose: canon + the editor's note (merged into the spine)
  techniques.json          the horizontal technique tags
  techniques/*.md          optional: a technique's long-form explanation (overrides the tag)
  usecases/*.md            one use case per file: YAML frontmatter + prose
  about/*.md               the three About pages
  pages/*.html             self-contained ancillary docs (Master PRD, IA Proposal)
  phases.json              GENERATED from lifecycle.json + phases/*.md (git-ignored snapshot)
src/
  lib/                     content loader, lifecycle compiler, markdown, links, html
  components.mjs           the design system as reusable template functions
  pages.mjs                page renderers (home, phase, activity, use case, …)
  gallery.mjs              the template gallery
  layout.mjs               the document shell
  build.mjs                the build: content + templates → dist/ (+ phase CSS)
  assets/                  css (base + the design's stylesheets) + the tiny modal js
scripts/
  build-content.mjs        compile + validate the lifecycle into content artifacts
  bootstrap-content.mjs    one-time: derived content/ from the design's data module
  serve.mjs                zero-dep local preview server
.claude/skills/            /build-content and /build-site skills
design-reference/          the original design handoff (provenance, not built)
```

At build time the loader reads `content/`, the components/pages turn it into
HTML, and everything is written to `dist/` as real directories (one
`index.html` per route) so it deploys anywhere. The **template gallery** renders
straight from `src/components.mjs`, so it stays an honest reference.

## The data layer: structured vs Markdown

There's no database — the **build is the database**: the content files are the
tables, `id`s are the keys, `loadContent()` is the query engine, and
`build-content` is the constraint layer. One rule decides where any given piece
of content lives:

> **Structured if you'd query it; Markdown if you'd read it.** A field is
> structured data (JSON or frontmatter) when the build or UI needs to **filter,
> sort, join, count, validate, or link** on it — ids, foreign keys, flags, tags,
> ordering, colors. It's Markdown prose when a human writes it in sentences and
> it renders as rich text — goals, approaches, canon lines, editor's notes, bios.
> Frontmatter is the hinge that lets one file carry both.

That resolves into three tiers:

| Tier | Lives in | Examples |
|---|---|---|
| **Config** | JSON | `site.json` — title, repo, home copy |
| **Taxonomy / skeleton** | JSON, id‑keyed | `lifecycle.json` (the spine), `techniques.json` (tags) |
| **Prose entities** | Markdown + frontmatter | `usecases/*.md`, `about/*.md`, `phases/*.md`, optional `techniques/*.md` |

The spine nests four deep — **lifecycle → phase → subphase → key activity**.
Phases hold **subphases** (named groupings), and subphases hold the **key
activities**. A use case still places by `activity` alone (activity ids are
globally unique), so its subphase is *derived*, not stored. Subphases aren't
their own pages — they render as deep‑linkable anchored sections on the phase
page (e.g. `phase/discover/#understand`) and as sub‑headers in the home spine.

So the spine's **structure** (ids, order, hue, the subphase grouping) is JSON in
`lifecycle.json`, while its **prose** (canon + the editor's note) is Markdown in
`content/phases/<id>.md` and merged back into the compiled spine at load time —
the same frontmatter‑plus‑body shape use cases already use. Full reasoning + the
decision record:
[`docs/data-layer-prd.md`](docs/data-layer-prd.md) and
[`docs/data-layer-decision.html`](docs/data-layer-decision.html).

### Editing phase prose

A phase's `content/phases/<id>.md` carries the editorial voice; short
activity‑level canon/editor lines ride in its frontmatter, keyed by activity id:

```markdown
---
id: discover
activities:
  d-research:
    canon: "Talk to a named customer before writing a line of spec."
    editor: "The highest-leverage place to point an agent."
---
## Canon

No solution may proceed without a named customer and a written problem.

## Editor's note

A leading line, then a paragraph of body.

- **A bold point.** Followed by the rest of the point.
```

A **technique** stays a one‑line tag in `techniques.json` until it needs real
explanation; then add `content/techniques/<id>.md` — its frontmatter overrides
the tag's fields and its Markdown body renders as the technique's detail.

## The lifecycle is data — changing the stages

The product‑development lifecycle (the **stages**, their **subphases**, and the
**key activities** within each) is notional and lives entirely in
**`content/lifecycle.json`** — the single source of truth for the spine. When
the structure changes, you don't touch templates or CSS:

1. Edit `content/lifecycle.json` for **structure** (add / rename / reorder /
   recolor phases, subphases, and activities — each phase holds `subphases[]`,
   each subphase holds `activities[]`), and `content/phases/<id>.md` for the
   **prose** (canon + the editor's note, keyed by activity id). Keep `id`s
   stable — use cases and the phase prose files reference them — or omit `id` on
   a new entry to auto‑slug it from the name. `hue` is optional (auto‑assigned);
   phase + subphase numbers and soft tints are derived. A new phase needs a
   matching `content/phases/<id>.md`. (A phase may still use a flat `activities[]`
   instead of `subphases[]`; it compiles as one implicit subphase.)
2. Run **`npm run build-content`** (or the **`/build-content`** skill). It
   compiles the spine, merges the per‑phase prose, writes the generated
   `content/phases.json` snapshot, and **validates** the content store —
   catching a use case that points at a renamed/removed stage, an unknown
   technique tag, a duplicate or under‑specified use case, or a phase missing
   its prose file — then prints a coverage report.
3. Run **`npm run build`** (or the **`/build-site`** skill) to render. The build
   also generates the phase‑keyed CSS (hue tokens, the featured‑card tints, and
   the spine‑rail gradient) from the lifecycle, so new stages render correctly
   with no CSS edits.

### Skills

Two committed Claude Code skills wrap the two steps:

| Skill | Does | Run directly |
|---|---|---|
| **`/build-content`** | Compile + validate the lifecycle into content artifacts (after editing `lifecycle.json`) | `npm run build-content` |
| **`/build-site`** | Render the static site from the content into `dist/` | `npm run build` |

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
