# AGENTS.md — Build instructions: AI PDLC Playbook

You are implementing the **AI PDLC Playbook** in a real codebase. **Read `PRD.md` (in this folder) first** — it is the product spec and the source of truth for behavior, IA, content model, and intent. This file covers *how to build it*: the design references, fidelity, exact tokens, per-screen specs, and interactions.

> **IA update (June 2026) — read `PRD.md §0` first.** The model simplified to **two entities**: a **Use case** on the lifecycle axis (**Goal → Approach → Impact**, where Approach = prose instructions + optional prompt/code + optional resource **links**, tagged with techniques) and a **Technique** = a **tag** with one **page per technique** that **aggregates the use cases tagged with it** (has a description, can be endorsed, can stand alone with zero use cases). **There is no standalone “Resource” entity** — “resources” are just links inside an approach. The **Resource page/index are removed** and the top nav is now **Lifecycle · Techniques · About**. Where sections below describe a Resource entity, treat them as superseded.

---

## About the design files

The files in this bundle are **design references created in HTML/React-via-Babel** — runnable prototypes that show the intended look and behavior. They are **not production code to copy verbatim**. Your task is to **recreate these designs in the target codebase's environment** using its established patterns, component library, router, and styling system. If no environment exists yet, choose an appropriate stack (a React + Vite SPA with a CSS-variable design system is a clean fit) and implement there.

To view the reference: open `AI PDLC Playbook.html` in a browser. It is a hash-routed SPA. The IA-exploration file (`AI PDLC Playbook — IA Explorations.html`) shows four rejected/considered home directions on a canvas — **context only; the chosen direction is "the spine," already built in the main prototype.**

## Fidelity

**High-fidelity.** Colors, typography, spacing, and the component vocabulary are final and should be reproduced faithfully. The one deliberately-rough area is **content** (canon lines, editor's notes, About-page bios) — these are first-draft copy and placeholders the editor will replace; structure them as editable data, not hardcoded strings.

---

## Design tokens

Reproduce these as your theme. (Prototype defines them in `styles.css`, `pb-styles.css`, `app-styles.css`.)

### Color
| Token | Value | Use |
|---|---|---|
| `--bg` | `#f7f5f0` | page background (warm paper) |
| `--bg-elev` | `#fbfaf6` | elevated surfaces, header |
| `--bg-card` | `#ffffff` | cards |
| `--ink` | `#1a1a1a` | primary text |
| `--ink-2` | `#3a3a3a` | secondary text |
| `--ink-3` | `#6b6b66` | tertiary / muted |
| `--ink-4` | `#9a9a93` | faint / disabled |
| `--rule` | `#e6e3da` | hairline borders |
| `--rule-2` | `#d4d1c7` | stronger borders |
| `--accent` | `#2d6a6a` | teal accent (also Discover hue) |
| `--accent-2` | `#1f4d4d` | accent dark |
| `--accent-soft` | `#ecf2ef` | accent tint bg |
| `--accent-tint` | `#d9e6e3` | accent tint border |

### Phase hues (lifecycle wayfinding)
| Phase | Hue | Soft bg |
|---|---|---|
| Discover | `#2d6a6a` | `#ecf2ef` |
| Build | `#4a5a8a` | `#e7e9f1` |
| Grow | `#3a7a4a` | `#e3ede1` |

Applied via a `--phase` CSS variable set per phase context; phase-colored elements (dots, swatches, titles, metric boxes, progress) read from it.

### Endorsement / "official" (brass)
| Token | Value | Use |
|---|---|---|
| `--seal` | `#9a7b3f` | seal icon, canon accent bar, endorse dot |
| `--seal-2` | `#7c6231` | endorsed text |
| `--seal-soft` | `#f3ecdb` | endorsed pill / callout bg |
| `--seal-line` | `#e4d7b6` | endorsed border |
| `--canon-bg` | `#faf7ef` | canon block background |

### Type
- **Serif (display):** `Newsreader` (Google Fonts), weights 400/500; italics used for editor's notes. Fallback `Georgia, serif`.
- **Sans (UI/body):** `IBM Plex Sans`, 400/500/600. Fallback `system-ui`.
- **Mono (labels/eyebrows/meta):** `IBM Plex Mono`, 400/500. Fallback `ui-monospace`.
- Scale: hero h1 `clamp(34px, 4.2vw, 50px)` serif 500, letter-spacing −0.02em; section h2 26px serif 500; leaf/detail title 34px serif 500; body 15–16px sans; eyebrows/labels 11px mono uppercase, letter-spacing ~0.12–0.14em; canon text 19px serif.

### Shape & spacing
- Radii: `--radius-sm 4px`, `--radius 8px`, `--radius-lg 14px`; pills `999px`.
- Content widths: wide `1300px`, narrow `1120px`, leaf grid `1fr / 300px`. Page gutter 40px.
- Card hover: `translateY(-1 to -2px)` + border darken to `--ink-3` + soft shadow `0 8px 26px -14px rgba(20,20,20,.2)`.
- Entrance: subtle `translateY(6px)` settle, **no opacity fade** (a paused/backgrounded tab can leave opacity-0 content invisible — animate transform only).

---

## Screens / views

See `PRD.md §8` for the full per-screen requirements. Implementation notes per view:

1. **Home** (`/`) — hero + **interactive spine board** (3 phase columns on a left→right rail gradient teal→indigo→green; phase header links to phase page; activity rows link to activity pages, show count or "—" dimmed when empty, brass dot when they contain endorsed practice) + **featured strip** (curated use cases) + **techniques board** (chips, endorsed ones seal-marked).
2. **Phase** (`/phase/:phaseId`) — hero (number, phase-hue dot, title in phase hue, 3-segment progress linking phases) → **Canon** (seal) → **EditorNote** → **activity index** (rows: canon line, endorsement badge, count or "No practice yet", arrow) → "resources across this phase" → prev/next.
3. **Activity** (`/activity/:activityId`) — hero → **Canon** (may be *silent*) → **EditorNote** (compact, optional) → **Practice** use-case grid **or confident empty state** with "+ Add the first use case" → "resources behind these use cases".
4. **Use-case detail** (`/use-case/:id`) — meta (placement tag, technique tags, endorsed seal) + title + **01 Problem / 02 Solution / 03 Impact(optional)** + phase-hue **metric box**; sidebar: endorsed callout, **Resources used**, **Placed on the spine**, **Tools**, **Contributed by**.
5. **Resource detail** (`/resource/:id`) — type badge + tags + endorsed seal + title + summary + **How it works** (+ code snippet) + **When to reach for it**; sidebar: endorsed callout, **Reusable across the lifecycle** count, **Used in** list (links to use cases), **First documented by**.
6. **Resources index** (`/resources`) — endorsed group first, then all.
7. **Techniques index** (`/techniques`) — list with counts; endorsed seal-marked.
8. **Technique page** (`/technique/:techId`) — hero (tag, seal, counts incl. "spans N phases") + two columns (use cases / resources) + "often appears with".
9. **About** (`/about/:which`, which ∈ pdlc|editor|initiative) — pdlc carries voice legend + endorsement explainer; editor + initiative carry a visible **draft marker** and (editor) a portrait slot.

### The three voices — reusable components (priority #1)
These are the heart of the design; build them as first-class, reusable components:
- **`<Canon text seal>`** — brass-accented block, left bar `--seal`, label "What the PDLC says" with a round seal vmark, optional "Protocol" seal tag top-right, 19px serif body. When `text` is empty → render the *silent* state ("The protocol is silent here…") in dim italic.
- **`<EditorNote text compact>`** — "ED" avatar + "Editor's note" label (ink vmark) + body + "— The Editor · AI in Product" byline (hidden when compact). The byline avatar/name are editable placeholders. **Supports two body shapes:** (a) a plain string → a single italic line (used for the *compact* activity-page note); (b) a rich object `{ lead, body, points[] }` → an italic serif **lead** line + a roman serif **paragraph** + a **bulleted list** (each bullet supports inline `**bold**` lead-ins, rendered via a tiny `renderBold` helper), shown as the **section's core intro** (used on phase pages). Model `phase.editor` as the rich object and `activity.editor` as the optional string — see `pb-data.js`. (The rich form also works on activity pages if you give that activity an object instead of a string.)
- **`<PracticeHead title count>`** — "Practice" label (accent vmark) + serif title + count pill; used above every field-content section.
- **`<Endorsed lg>`** — brass seal pill "PDLC-endorsed". **`<Seal>`** icon = ring + checkmark (simple SVG; not a brand mark).

Keep the three voices **unmistakably distinct** (brass/official vs. ink/personal-italic vs. accent/card). Don't let them blur together. **There is no literal "voice legend" widget** — the distinction is carried by consistent labeling and treatment across the IA (and documented here), not displayed as a key.

---

## Interactions & behavior

- **Routing:** hash-based in the prototype (`#/phase/discover`, etc.); use the codebase's real router. On every navigation, scroll to top. All cards, breadcrumbs, tags, list rows, and "used in / resources used" entries are navigable.
- **Submit modal (GitHub issues):** opened by the header "Submit a use case" button and by every contextual **`<AddLink>`** ("+ Add to this phase / activity / section", "+ Tag a use case"). The modal explains the GitHub-issue flow, previews the scoped issue template, and has a primary **"Open a GitHub issue"** action. **Build task:** wire the primary action to the repo's issue-template deep link (template + prefilled title/labels for the scope). The prototype stubs this (closes the modal). Modal closes on backdrop click, ×, or Cancel.
- **Empty states:** activities/sections with no practice render a confident dashed empty state + an Add link — never an error or blank.
- **Hover:** cards lift; nav/links underline or tint; respect `prefers-reduced-motion`.
- **Responsive:** prototype is desktop-first (designed ~1280px). Recreate responsive behavior in the target system (the leaf `1fr/300px` grid should stack on narrow viewports; the 3-column spine should wrap).

## State management

Minimal. v1 is a read app over a **curated content store**:
- Route state (current page + params).
- Submit-modal state (open + scope `{kind, label}`).
- All content (`PHASES`, `TECHNIQUES`, `RESOURCES`, `USECASES`, `ABOUT`) comes from a data module — see `pb-data.js` for the **exact schema and seed content**. Model it as your data layer (typed models / API). Note the many-to-many: use cases reference resource ids; resources derive "used in" by reverse lookup. Derive technique counts and phase/activity rollups from the data.

No global app state library is required; local state + a data module suffices for v1.

---

## Assets

- **Fonts:** Newsreader, IBM Plex Sans, IBM Plex Mono (Google Fonts). No other external assets.
- **Icons:** small inline SVGs only (search, arrow, seal=ring+check, "issue"=ringed dot, chevrons). No icon library required; no brand marks. The "GitHub" affordance uses a generic ringed-dot "issue" glyph, **not** the GitHub octocat — keep it generic or swap for the codebase's own GitHub icon if licensed.
- **Imagery:** none shipped. The About-editor page has a **portrait placeholder slot** (striped placeholder) for the editor to supply a real image.
- No Anthropic brand assets are used; if your codebase has a brand system, prefer it for chrome while preserving this palette/type intent.

---

## Files in this bundle

| File | What it is |
|---|---|
| `PRD.md` | Product requirements — **read first**. |
| `AGENTS.md` | This file — build instructions. |
| `AI PDLC Playbook.html` | Main prototype entry (hash-routed SPA). |
| `app.jsx` | Route switch + app shell. |
| `app-core.jsx` | Router, the three-voice components, `<Endorsed>`/`<Seal>`, submit modal + `<AddLink>`, header/footer, cards, tags. |
| `app-home.jsx` | Home: interactive spine, featured, techniques board. |
| `app-phase.jsx` | Phase page + Activity page. |
| `app-detail.jsx` | Use-case, Resource, Technique pages + Resources/Techniques indexes. |
| `app-about.jsx` | About pages (PDLC / editor / initiative). |
| `pb-data.js` | **Content model + seed data + derived helpers** — the schema source of truth. |
| `styles.css` | Base tokens & primitives (carried over from the design system). |
| `pb-styles.css` | Spine, cards, leaf scaffolding, metric box. |
| `app-styles.css` | The three voices, endorsement seal, submit modal, About pages, app shell. |
| `AI PDLC Playbook — IA Explorations.html` | Context only — four considered home directions (the spine won). |

Build order suggestion: data layer (from `pb-data.js`) → tokens/theme → the three-voice + endorsement components → spine/home → phase/activity → detail pages → indexes → about → submit modal + real issue deep-links.
