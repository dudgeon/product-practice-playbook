# PRD — AI PDLC Playbook

**Status:** Prototype complete · ready for build
**Owner:** The Editor (AI in Product initiative)
**Last updated:** June 2026
**Companion doc:** `AGENTS.md` (implementation instructions for the coding agent) — read this PRD first for product context.

---

## 0. IA update — June 2026 (authoritative; supersedes any conflicting detail below)

The content model was simplified after a structure review. Where older sections below mention a standalone **“Resource”** entity, read them through this update:

- **Two entities, two browse axes.**
  - **Use case** (lifecycle axis) = a specific problem solved a specific way for a specific user, placed on the spine (one phase → one activity). Shape: **Goal/Problem → Approach → Impact (optional)**.
    - **Approach** = the “how”: prose **instructions** (may include an actual **prompt**/code block) plus optional **resource _links_** (label + URL).
    - The approach is **tagged with techniques**.
  - **Technique** (horizontal axis) = **a tag**. One **page per technique**, which **aggregates the use cases tagged with it**, carries a short editorial **description**, and can be **endorsed**. A technique page can exist with **zero use cases** (rare), and offers an **“I used this — add your use case”** path.
- **There is no standalone, browsable “Resource” entity.** “Resources” are just **links inside a use case’s approach**. The old Resource detail page and Resources index are **removed**, and **“Resources” is gone from the top nav** (nav is now **Lifecycle · Techniques · About**).
- **Technique ≠ the old Resource.** The old “Resource” substance lives inside use-case approaches now; “Technique” is the cross-cutting tag/aggregation page.
- **Endorsement** applies to **techniques** (and exemplar use cases). **Use-case shape stays Problem · Solution(=Approach) · Impact**, impact optional.
- **Tags stay flat** for now (emergent), to cluster into families later.

Net data model: `usecase { problem, solution, prompt?, links?[], impact?, metric?, techniques[], placement, tools, author, featured, endorsed }` · `technique { id, name, description, endorsed }`. See `pb-data.js` for the live schema.

---

## 1. Summary

The **AI PDLC Playbook** is a curated, lightly-opinionated library of AI-augmented product craft. It collects the **use cases** and **resources** (techniques, patterns, templates) that teams use to do product work with AI, and organizes them along a fixed **Product Development Lifecycle (PDLC)** — a thin, official 3-phase protocol that acts as the spine of the whole experience.

It is deliberately **not** a neutral, emergent-taxonomy platform. The lifecycle is a defined structure with a point of view, layered with three clearly-distinguished editorial voices.

---

## 2. Background & motivation

A predecessor effort ("Practice Hub") was built as a neutral platform: emergent taxonomy, no opinion about which contributions were best, a venue for others' ideas. It worked, but it lacked a backbone — everything was equally weighted and the taxonomy sprawled.

This project takes the opposite stance on structure:

- **A defined spine.** The PDLC is a fixed lifecycle (Discover → Build → Grow), each phase with a handful of key activities. Everything hangs off it.
- **An information hierarchy.** Two first-class entities — **use cases** and **resources** — are placed against the spine.
- **A point of view.** The protocol is thin but official; an editor expands on it; the field fills in practice. These three voices are always visually distinguished.
- **Curated, not democratic.** Community/engagement signals (reactions, leaderboards, "X teams tried this") are intentionally stripped. The editor curates.

---

## 3. Goals & non-goals

### Goals
- Make AI-augmented product work **legible**: collect what's working and organize it against a shared lifecycle.
- Lower the cost of adopting a good pattern from "rebuild it yourself" to "read this and fork it."
- Distinguish clearly between **what the protocol says**, **the editor's interpretation**, and **what practitioners actually do**.
- Provide a low-ceremony **contribution path** (GitHub issues) so the library grows from the field.
- Allow proven practices to be **endorsed** — promoted into the protocol's recommendations.

### Non-goals (for v1)
- No accounts, profiles, reactions, voting, leaderboards, or adoption tracking.
- No in-app submission/editing flow — **all contribution is via GitHub issues**.
- No emergent/auto-clustered taxonomy of techniques yet (they stay flat tags — see §6.4).
- No full-text search backend in v1 (the search field is a placeholder; can be client-side later).
- Not a replacement for documentation of the tools themselves; it documents *usage patterns*.

---

## 4. Audience

Primary audience: **a broad organization spanning many product teams** (PMs, designers, engineers, researchers, ops).

| Persona | Need | Primary path |
|---|---|---|
| **The practitioner** mid-task | "I'm in launch planning — what have others done?" | Spine → phase → activity → use cases |
| **The newcomer** | "What is this and how is it organized?" | Home → voice legend → About the PDLC |
| **The contributor** | "I built something worth sharing." | Any "+ Add" link / Submit → GitHub issue |
| **The editor** (the initiative lead) | Curate, place on the spine, write notes, endorse | (Editorial workflow, §10 — largely out-of-app via the repo) |

---

## 5. The spine (lifecycle model)

The PDLC is **3 linear phases**, each containing **5–8 key activities**. Phases are high-level; activities are where practice lives. Each phase and (optionally) each activity carries an official **canon** statement.

> The phase and activity names below are the prototype's proposal and are expected to be finalized by the editor. Treat them as data, not as hardcoded structure.

### Phase 01 — Discover · `#2d6a6a` (teal)
*Understand the problem and decide what to build.*
Canon: "No solution may proceed without a named customer, a written problem, and evidence the problem is worth solving."
Activities: Customer research · Problem framing · Market & competitive sensing · Opportunity sizing · Requirements & specs · Prioritization

### Phase 02 — Build · `#4a5a8a` (indigo)
*Design, prototype, and ship the thing.*
Canon: "Every step produces a reviewable artifact. Decisions are recorded with their rationale. Quality gates precede release."
Activities: Design & prototyping · Engineering · Code review & QA · Technical decisions · Documentation · Testing & evals

### Phase 03 — Grow · `#3a7a4a` (green)
*Launch, learn, and keep it running.*
Canon: "Releases are measured and reversible. Operations have an owner. Findings return to Discover."
Activities: Launch & GTM · Rollout & enablement · Analytics & experimentation · Iteration & optimization · Operations & toil · Support & feedback loops

**Design intent of the "thin protocol":** Many activities will legitimately have **no documented practice yet** and **no canon** ("The protocol is silent here"). This emptiness is a feature, not an unfinished state — it shows where the field hasn't filled in and invites contribution. Empty activities must render as confident empty states, never as errors.

---

## 6. Core concepts

### 6.1 The three voices (the central UX idea)
Every substantive block of content is labeled by voice and visually distinct:

1. **Canon — "what the PDLC says."** Thin, authoritative, official. Sealed/brass treatment. Sparse (one or two sentences). May be *silent*. (Label reads simply “What the PDLC says.”)
2. **Editor's note — "my expansion on the canon."** Opinionated, clearly the editor's, not the protocol's. Bylined, serif, personal. On **phase pages** this is the **core intro to the section** — a lead line, a paragraph or two, and a few bullets — not a short aside. On **activity pages** it's an optional one-line note.
3. **Practice — "what teams are actually doing."** The bulk of the content: use case and resource cards.

These three must be **unmistakable at a glance** — carried by consistent labeling and visual treatment across the whole IA, **not** by a literal on-screen "legend." A reader should never confuse the protocol's voice with the editor's opinion or with field reports.

### 6.2 Endorsement
When a practice proves itself across enough teams, the editor can **endorse** it — promoting it from practice into the protocol's recommendations. Endorsed **resources** and **techniques** (and optionally exemplar **use cases**) carry a brass **PDLC-endorsed seal**. Endorsement is the only way the thin protocol grows, and it is deliberately slow/rare.

### 6.3 Information hierarchy: Use cases & Resources

**Use case** = a problem a team solved with AI-augmented craft.
- Fields: title, **problem**, **solution**, **impact** (optional, may include a headline metric), placement on the spine (one phase + one activity), technique tags (0..n), resources used (0..n references), tools, author/team, `featured` flag, `endorsed` flag.

**Resource** = a reusable technique/pattern/template/principle, **standalone AND attachable to many use cases**.
- Fields: name, type (Pattern / Skill / Template / Prompt / Principle / Tool config), summary, optional "how it works" + code snippet, technique tags, author/team, `endorsed` flag.
- A resource is its own browsable page and shows **"used in N use cases"** — reusability is a first-class, visible property.

Relationship: a use case **references** resources by id; a resource lists the use cases that reference it. Many-to-many.

### 6.4 Horizontal techniques (emergent tags)
Cross-cutting skills (e.g. Subagents, Prompt engineering, Evals, MCP & tools). Unlike the lifecycle, there is **no fixed taxonomy**: techniques are **flat tags** for now, applied to use cases and resources. They get their own aggregation pages. The intent is to **cluster them into a richer structure in a future refactor** once patterns settle — the data model should not assume the flat structure is permanent.

---

## 7. Information architecture / navigation map

```
Home (the spine is the primary navigation)
├── Phase page                /phase/:phaseId
│   └── Activity page          /activity/:activityId
│       └── Use-case detail    /use-case/:id
│           └── Resource detail /resource/:id
├── Resources index           /resources
│   └── Resource detail        /resource/:id
├── Techniques index          /techniques
│   └── Technique page         /technique/:techId
└── About                      /about/:which   (pdlc | editor | initiative)
```

Cross-links: use cases ↔ resources ↔ techniques ↔ phases/activities are all mutually navigable. The spine is reachable from the brand/Lifecycle nav at all times.

---

## 8. Feature requirements by screen

### 8.1 Home
- Hero: initiative kicker, headline, one-paragraph mission.
- **Interactive spine board**: 3 phase columns on a connecting rail. Phase headers link to phase pages; each activity row links to its activity page and shows a use-case count (or "—" when empty, dimmed). Activities containing endorsed practice show a small brass dot.
- **Featured strip** (thin): a few editor-curated use cases.
- **Techniques board**: all technique tags as chips (endorsed tags carry the seal), linking to technique pages. Caption notes techniques are emergent tags.

### 8.2 Phase page
- Breadcrumb; phase hero (number, dot in phase hue, title, tagline, 3-segment progress that links across phases).
- **Canon** block (with Protocol seal) + **Editor's note**.
- **Activity index**: each activity as a row with its canon line (italic/dim when silent), endorsement badge if applicable, use-case count or "No practice yet", and an arrow. Links to the activity page.
- "Resources used across this phase" grid.
- Prev/next phase navigation. An "+ Add to this phase" affordance.

### 8.3 Activity page
- Breadcrumb (Lifecycle › Phase › Activity); activity hero (phase context label, name).
- **Canon** (may be silent) + **Editor's note** (compact, if present).
- **Practice** section: use-case cards, or a confident empty state with "+ Add the first use case" when none.
- "Resources behind these use cases" grid (if any).

### 8.4 Use-case detail
- Breadcrumb; meta row (placement tag → phase, technique tags, endorsed seal if endorsed).
- Title; three labeled sections: **01 Problem**, **02 Solution**, **03 Impact** (marked *optional*); optional headline **metric box** in the phase hue.
- Sidebar: endorsed callout (if endorsed); **Resources used** (each links to its resource, labeled reusable/endorsed); **Placed on the spine** (phase › activity, plus which techniques it also surfaces under); **Tools**; **Contributed by** (author/team).

### 8.5 Resource detail
- Breadcrumb (Resources › type); meta row (type badge, technique tags, endorsed seal).
- Title; summary; **How it works** (+ optional code snippet); **When to reach for it**.
- Sidebar: endorsed callout (if endorsed); **Reusable across the lifecycle** (the count, prominent); **Used in** (list of referencing use cases, each linking out, showing its phase); **First documented by**.

### 8.6 Resources index
- Hero. **Endorsed** section first ("Recommended by the protocol"), then **all resources**. "+ Add a resource" affordance.

### 8.7 Techniques index
- Hero. List of all techniques (endorsed ones seal-marked) with use-case + resource counts; each links to its technique page.

### 8.8 Technique page
- Breadcrumb (Techniques › #name); hero (tag, endorsed seal if endorsed, description, counts: N use cases / N resources / spans N phases).
- Two columns: **use cases using this technique** and **resources tagged**; "often appears with" related-technique chips. "+ Tag a use case" affordance.

### 8.9 About (3 pages)
- **About the PDLC**: explains the thin protocol, the three voices (in prose), and endorsement. Includes an **endorsement-seal explainer** (a sample seal + what it means). No literal voice-legend widget.
- **About the editor**: first-person; placeholder bio + portrait slot (carries a visible "draft" marker until filled).
- **About AI in Product**: the initiative; how to take part (GitHub issues). Also carries a "draft" marker.
- Cross-links between the three; reachable from the footer.

---

## 9. Contribution model (GitHub issues)

All contribution is **GitHub-issue based** — public, low-ceremony, discussable before merge. There is **no in-app write path**.

- A global **"Submit a use case"** button in the header.
- Contextual **"+ Add …"** links throughout (phase, activity, technique, resource sections), scoped to that location.
- Each opens a modal that: explains the GitHub-issue flow, previews the relevant **issue template** (fields prefilled with the scope, e.g. the target phase › activity), and offers a primary **"Open a GitHub issue"** action.
- In the build, the modal's primary action should deep-link to the repo's **issue template** with the right template + prefilled title/labels (`?template=use-case.yml&...` or equivalent). The prototype stubs this — wiring the real URLs is a build task.

Suggested issue templates to author in the repo: **New use case**, **New resource**, **Tag/endorsement suggestion**.

---

## 10. Editorial workflow (largely out-of-app)

1. Contributor opens a GitHub issue from a template.
2. The **editor** triages: accepts, **places it on the spine** (assigns phase + activity), adds technique tags, links/extracts any reusable **resource**, and writes the **editor's note**.
3. Content is merged (e.g. as structured data / Markdown in the repo) and appears in the library.
4. Over time, the editor may **endorse** a resource/technique that has proven itself.

The app reads from this curated content store. v1 can ship with content as a static data module (as in the prototype) and evolve toward repo-backed Markdown/JSON.

---

## 11. Success metrics (directional)

- **Coverage**: % of activities with ≥1 documented use case (watch the spine fill in over time).
- **Reuse**: average # of use cases per resource (resources earning their keep).
- **Contribution**: issues opened per month; time-to-placement by the editor.
- **Endorsement velocity**: # of endorsed resources/techniques (deliberately low/slow).
- **Adoption (qualitative)**: teams citing a playbook pattern in their own work.

---

## 12. Phasing

**v1 (this prototype's scope):** the full read experience — spine, phase/activity/detail pages, resources & techniques indexes, About pages, the three-voice system, endorsement seals, and the GitHub-issue submit affordances (modal + deep links). Content as a curated static data module.

**Later:** client-side or backend search; repo-backed content pipeline; technique clustering refactor (§6.4); editor tooling; optional lightweight signals if ever desired.

---

## 13. Open questions

- Final phase & activity names (editor to confirm).
- Exact endorsement criteria and who can endorse (just the editor?).
- Whether use cases can ever be endorsed, or only resources/techniques.
- Content storage format for the build (static module vs repo Markdown vs CMS).
- Real GitHub repo + issue-template URLs.
- The editor's real identity/bio and the initiative's real description (currently placeholders).
