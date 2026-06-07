# PRD — The Playbook Data Layer (no-database era)

**Status:** Draft for owner decision — *reconciled against PR #4*
**Author:** Claude (Ultracode)
**Date:** 2026-06-07
**Decision artifact:** [`docs/data-layer-decision.html`](./data-layer-decision.html) — open via the preview link in the cover note, make your selections, and use **Copy decision to Claude** to lock it.

> **Reconciliation note (PR #4 — "Abstract the lifecycle to JSON").** Since this
> PRD was first drafted, #4 landed and changed two of its premises:
> 1. **The spine moved.** `content/lifecycle.json` is now the editable source of
>    truth for phases + activities (with auto-derived ids/numbers/tints);
>    `content/phases.json` is a **generated, git-ignored snapshot** compiled by
>    `npm run build-content`.
> 2. **A validation gate now exists.** `src/lib/lifecycle.mjs` (`validateContent`)
>    + `scripts/build-content.mjs` check duplicate ids, use-case placement
>    (phase/activity foreign keys), and technique tags, and **fail the build** on
>    a broken reference. This is most of original **Decision 3.**
>
> What #4 did **not** change: editorial prose (`canon`, `editor.*`) still lives
> as JSON strings — now inside `lifecycle.json` — with `**markdown**` embedded in
> them. The owner's call on **D1 is to lift all of that prose out into per-phase
> Markdown** (see §7). Decisions D2 and D4 are unaffected.

---

## 1. Summary

The Playbook is a zero-framework static site: content lives in files under
`content/`, a build step turns it into a deployable `dist/`. There is **no
database, and there does not need to be one yet.** This PRD settles *how the
file-based data layer should be organized* — specifically, **which content
belongs in Markdown and which belongs in a structured format (JSON)** — so the
site stays easy to author, easy to validate, and cheap to migrate to a real
database later if it ever earns one.

The recommendation, in one line: **draw the boundary by the nature of each
field, not by the type of entity.** A value belongs in *structured data* if you
would ever **filter, sort, join, count, or validate** on it; it belongs in
*Markdown prose* if a human writes it in sentences and it's rendered as rich
text. PR #4 already applied this to *structure* (the spine is data, and it's
validated). The remaining work is to apply it to *prose* — get the editorial
voice out of JSON strings.

---

## 2. Current state (post-#4)

The data layer is a **hybrid that #4 made much more deliberate** on the structure
side. Mapping it honestly today:

| Store | Format | What's in it | Prose? |
|---|---|---|---|
| `content/site.json` | JSON | Title, repo, home-page copy strings | A little (home lede/headline) |
| `content/lifecycle.json` | JSON | **The spine source of truth**: phases → activities, plus `canon`, `editor.lead/body/points` | **A lot** — editorial prose with `**markdown**` inside JSON strings |
| `content/phases.json` | JSON *(generated, git-ignored)* | Compiled snapshot of the spine (auto ids/numbers/tints) | Mirrors the prose from `lifecycle.json` |
| `content/techniques.json` | JSON | Technique tags: `id`, `name`, `endorsed`, `description` | Some (one-line `description`) |
| `content/usecases/*.md` | **Markdown + YAML frontmatter** | One use case per file. Frontmatter = handles; body = `## Goal / ## Approach / ## Impact` | **Yes** — the model that works |
| `content/about/*.md` | Markdown + frontmatter | The three About pages | Yes |
| `content/pages/*.html` | Standalone HTML | Master PRD, IA Proposal | N/A |

The processing pipeline is now:
`lifecycle.json → build-content (compile + **validate**) → phases.json snapshot
→ loadContent() → build.mjs → dist/`.

### What works
- **Use cases are exemplary.** Frontmatter = structured handles; body = prose.
  The pattern to generalize.
- **`loadContent()` is the query layer** — lookups, reverse indexes, rollups.
- **#4 added the constraint layer.** `compileLifecycle` rejects duplicate/missing
  ids; `validateContent` rejects broken placements and unknown technique tags;
  `build-content` gates `build`. *Original D3 is largely solved.*

### What still hurts
- **Editorial prose is still trapped in JSON** — it just moved from
  `phases.json` to `lifecycle.json`. `editor.body` and `editor.points[]` are real
  authored paragraphs, with `**bold**` inside JSON strings: escaping pain, no
  rich-text render path. **This is the one remaining wound, and the focus of D1.**
- **Validation has small gaps.** It checks placements and tags, but not
  *duplicate use-case ids* or *presence of required use-case frontmatter*
  (`id`, `title`, `phase`, `activity`). Cheap to close (D3, extended).
- **No documented "where's the line?" rule.** #4 documented lifecycle-as-data,
  but not the general structured-vs-Markdown principle (D4).

---

## 3. Goals & non-goals

**Goals**
1. A single, statable rule for **Markdown vs structured**, applied consistently.
2. Get the **last of the editorial prose out of JSON strings** (`lifecycle.json`).
3. **Close the validation gaps** #4 left (duplicate ids, required fields).
4. Keep authoring **friendly to humans and to Claude** (contribution = GitHub
   issues + PRs; both writers edit text files).
5. **Don't paint us into a corner** — the model should map cleanly onto DB rows.

**Non-goals**
- A real database, CMS, or API. Out of scope.
- Changing the information architecture (two entities, two browse axes) — settled.
- Re-litigating #4's spine-as-data design — we build *on* it.

---

## 4. The principle (the heart of the decision)

> **Structured if you'd query it; Markdown if you'd read it.**
>
> A field goes in **structured data** (JSON or frontmatter) when the build or UI
> needs to **filter, sort, join, count, validate, or link** on it — ids, foreign
> keys, flags, tags, metrics, ordering, colors.
>
> A field goes in **Markdown prose** when a human authors it in sentences and it
> is **rendered as rich text** — goals, approaches, editor's notes, canon lines,
> long descriptions, bios.

Frontmatter is the hinge that lets one file hold both. Use cases prove it works;
#4 proved the *structured* half for the spine. D1 finishes the *prose* half.

---

## 5. The proposed model — three tiers

### Tier 1 — Config → **JSON**
`site.json`. Pure key/value. **Leave as JSON.**

### Tier 2 — Taxonomy / skeleton → **structured (JSON), id-keyed**
The *shape* of the site. **`lifecycle.json`** (the spine: phase/activity ids,
order, hue, names, relationships) and **`techniques.json`** (tag list). Small,
stable, referenced by id, validated at compile time. **Stays structured — but
the prose currently mixed into `lifecycle.json` moves out** (D1).

### Tier 3 — Prose entities → **Markdown + frontmatter**
- **Use cases** — already here. No change.
- **About pages** — already here. No change.
- **Per-phase / per-activity editorial prose** — `canon`, `editor.*` — *moves
  here from `lifecycle.json`* (D1).
- **Technique long-form** — graduates to Markdown when it outgrows one line (D2).

---

## 6. The "no database" insight (updated)

With no database, the build *is* the database — and after #4, almost every piece
is in place:

| Database concept | This project's equivalent |
|---|---|
| Tables | The content stores (`usecases/`, `lifecycle.json`, `techniques.json`) |
| Rows | One Markdown file / one array entry |
| Columns | Frontmatter keys / JSON fields |
| Rich-text column | The Markdown body |
| Primary keys | `id` (`u-research`, `d-sensing`, `t-evals`) |
| Foreign keys | `phase`, `activity`, `techniques[]` references |
| Query engine | `loadContent()` and its reverse indexes |
| Schema / constraints | **`src/lib/lifecycle.mjs` + `build-content` (added in #4)** — extend to close the small gaps |

The constraint layer is no longer missing; it just needs the two small gaps
closed (D3, extended).

---

## 7. Decisions for the owner

Defaults in the artifact reflect the calls below.

### Decision 1 — Where does the editorial prose in `lifecycle.json` live?  ✅ *owner: lift all prose to Markdown*
- **A. Leave it in `lifecycle.json` JSON strings.** Zero work; the wound persists.
- **B. Lift the long editor notes only.** Keep short `canon` one-liners in
  `lifecycle.json`; move `editor.*` to Markdown. Hybrid.
- **C. (Owner's choice) Lift *all* spine prose to Markdown.** `lifecycle.json`
  keeps only the skeleton (ids, names, order, hue, tagline); both `canon` *and*
  `editor.*` move to `content/phases/<id>.md` with frontmatter handles.
  `build-content` merges that prose back into the generated `phases.json`
  snapshot, so everything downstream is unchanged. Mirrors how use cases work and
  gives canon + editor's notes a real rich-text path.

### Decision 2 — How are techniques represented?
- **A. (Recommended) JSON now, Markdown when they grow.** Keep
  `techniques.json` as the tag list; the loader prefers an optional
  `content/techniques/<id>.md` when present.
- **B. Move all techniques to Markdown now.** Premature.
- **C. Keep techniques JSON-only, indefinitely.** Caps how rich a technique page gets.

### Decision 3 — The validation gate (already added in #4): extend it?
- **A. (Recommended) Extend it.** #4 validates placements + tags + duplicate
  phase/activity ids. Add: **duplicate use-case ids** and **required use-case
  frontmatter present** (`id`, `title`, `phase`, `activity`). Also fold the new
  per-phase Markdown (from D1) into the compile + validate pass.
- **B. Leave as-is.** #4's checks are enough for now.
- **C. n/a — already covered.** Treat D3 as closed by #4.

### Decision 4 — Document the guiding principle as a rule?
- **A. (Recommended) Yes** — write "structured if you'd query it, Markdown if
  you'd read it" + the three tiers into the README / contributing notes, alongside
  #4's lifecycle-as-data section.
- **B. No** — decide case by case.

---

## 8. Recommendation

**1C (owner) + 2A + 3A + 4A.** Concretely:

1. Slim each `lifecycle.json` phase/activity to skeleton; move `canon` + `editor.*`
   into `content/phases/<id>.md` (frontmatter handles + Markdown body).
   `build-content` reads those files and merges the prose into the compiled
   `phases.json` snapshot — downstream rendering unchanged.
2. Keep `techniques.json` as the tag list; add an optional
   `content/techniques/<id>.md` override the loader prefers when present.
3. Extend `validateContent` (and the compile pass) to cover duplicate use-case
   ids, required use-case frontmatter, and the new per-phase Markdown.
4. Document the principle + the three tiers in the README.

This keeps every win (use-case frontmatter, the `loadContent` query layer, #4's
spine-as-data + validation, portable `dist/`), removes the last real wound
(prose-in-JSON), and hardens the constraint layer #4 introduced.

---

## 9. Migration path (low-risk, incremental)

1. **Extend the validation gate** against today's content (duplicate use-case
   ids + required frontmatter) — cheap, and it runs before anything moves.
2. **Migrate one phase** (`discover`): create `content/phases/discover.md` with
   `canon` + editor's note, slim the `lifecycle.json` entry to skeleton, teach
   `build-content`/`compileLifecycle` to merge per-phase Markdown into the
   snapshot. Confirm byte-identical rendered output.
3. **Migrate the remaining phases**, then delete the prose fields from
   `lifecycle.json`.
4. **Add the technique-Markdown override** (loader change; zero content churn
   until a technique needs it).
5. **Write the README section.**

Each step is independently shippable and reversible; rendered HTML shouldn't
change until we *want* it to.

---

## 10. Future: when does a real database earn its place?

Triggers: per-user state, contributions written *through the site*, full-text
search at scale, concurrent multi-editor writes. **None are on the table.** The
frontmatter+id model maps mechanically onto a DB later: **frontmatter → columns,
Markdown body → rich-text column, `id` → primary key, references → foreign
keys.** Same shape at both scales.

---

## 11. Open questions for the owner

- Is the home-page microcopy in `site.json` worth moving to Markdown, or fine as
  config strings? (Assumed: leave it.)
- Are `content/pages/*.html` (Master PRD, IA Proposal, this doc) part of the data
  layer, or standalone artifacts outside it? (Assumed: outside.)
- Any appetite for YAML over JSON for the skeleton files (comments + less
  punctuation noise), or keep JSON for tooling familiarity?
