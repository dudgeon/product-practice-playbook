# PRD — The Playbook Data Layer (no-database era)

**Status:** Draft for owner decision
**Author:** Claude (Ultracode)
**Date:** 2026-06-07
**Decision artifact:** [`docs/data-layer-decision.html`](./data-layer-decision.html) — open via the preview link in the cover note, make your selections, and use **Copy decision to Claude** to lock it.

---

## 1. Summary

The Playbook is a zero-framework static site: content lives in files under
`content/`, a build step (`src/build.mjs` + `src/lib/content.mjs`) turns it into
a deployable `dist/`. There is **no database, and there does not need to be one
yet.** The question this PRD settles is *how the file-based data layer should be
organized* — specifically, **which content belongs in Markdown and which belongs
in a structured format (JSON/YAML)** — so that the site stays easy to author,
easy to validate, and cheap to migrate to a real database later if it ever earns
one.

The recommendation, in one line: **draw the boundary by the nature of each
field, not by the type of entity.** A value belongs in *structured data* if you
would ever **filter, sort, join, count, or validate** on it; it belongs in
*Markdown prose* if a human writes it in sentences and it renders as rich text.
Apply that rule consistently and the current "sometimes JSON, sometimes
Markdown" situation becomes a deliberate three-tier model.

---

## 2. Current state (what we have today)

The data layer is **already a hybrid** — it just grew organically rather than by
decision. Mapping it honestly:

| Store | Format | What's in it | Prose? |
|---|---|---|---|
| `content/site.json` | JSON | Title, repo, home-page copy strings | A little (home lede/headline) |
| `content/phases.json` | JSON | The lifecycle **spine**: phases → activities, plus `canon`, `editor.lead/body/points` | **A lot** — editorial prose with `**markdown**` inside JSON strings |
| `content/techniques.json` | JSON | Technique tags: `id`, `name`, `endorsed`, `description` | Some (one-line `description`) |
| `content/usecases/*.md` | **Markdown + YAML frontmatter** | One use case per file. Frontmatter = `id`, `phase`, `activity`, `techniques[]`, `tools[]`, `metric`, `links[]`, flags. Body = `## Goal / ## Approach / ## Impact` prose | **Yes** — this is the model that works |
| `content/about/*.md` | Markdown + frontmatter | The three About pages | Yes |
| `content/pages/*.html` | Standalone HTML | Master PRD, IA Proposal — self-contained docs | N/A (hand-built) |

`src/lib/content.mjs` reads all of this into one in-memory object and exposes
lookups and reverse indexes (`ucByTechnique`, `techniquesInPhase`,
`activityEndorsed`, …). **That function is already a query layer** — it is the
closest thing the project has to a database engine.

### What works
- **Use cases are exemplary.** Frontmatter holds the structured *handles* (the
  things we filter and join on); the body holds the three-voice prose. This is
  the pattern to generalize.
- **`loadContent()` as a query layer** keeps every downstream consumer
  (components, pages) ignorant of file layout.

### What hurts
- **Editorial prose is trapped in `phases.json`.** `editor.body` and
  `editor.points[]` are real authored paragraphs — with `**bold**` Markdown
  *inside JSON strings*. Editing them means escaping, single-line `\n` pain, and
  no rich-text rendering path. This is the single worst spot in the data layer
  and the thing that prompted this PRD.
- **No referential integrity.** A use case can reference `activity: b-review` or
  `techniques: [t-typo]` that don't exist; nothing catches it until a page
  renders wrong (or blank). With no DB enforcing foreign keys, *nothing* enforces
  them.
- **No "where's the line?" rule.** Techniques are JSON; use cases are Markdown.
  Both are content entities. The inconsistency is the symptom; the absence of a
  principle is the cause.

---

## 3. Goals & non-goals

**Goals**
1. A single, statable rule for **Markdown vs structured**, applied consistently.
2. Get **editorial prose out of JSON strings** and into an editable, renderable form.
3. Make the **build the integrity layer** — catch broken references and missing
   required fields before they ship.
4. Keep authoring **friendly to humans and to Claude** (the contribution model is
   GitHub issues + PRs; both writers are editing text files).
5. **Don't paint us into a corner** — whatever we choose should map cleanly onto
   database rows later.

**Non-goals**
- Standing up an actual database, CMS, or API. Explicitly out of scope.
- Changing the *information architecture* (two entities, two browse axes). That's
  settled in the IA Proposal; this is about *storage*, not *model*.
- Rewriting `content.mjs`'s query helpers (they're fine).

---

## 4. The principle (the heart of the decision)

> **Structured if you'd query it; Markdown if you'd read it.**
>
> A field goes in **structured data** (JSON/YAML or frontmatter) when the build
> or UI needs to **filter, sort, join, count, validate, or link** on it — ids,
> foreign keys, flags, tags, metrics, ordering, colors.
>
> A field goes in **Markdown prose** when a human authors it in sentences and it
> is **rendered as rich text** — goals, approaches, editor's notes, canon lines,
> long descriptions, bios.

Frontmatter is the hinge that lets one file hold both: the *handles* on top, the
*prose* below. Use cases already prove it works.

---

## 5. The proposed model — three tiers

Apply the principle and the data layer resolves into three clean tiers:

### Tier 1 — Config → **JSON**
`site.json`. Pure key/value: title, repo, URLs, home-page microcopy. No prose to
speak of, never joined on. **Leave as JSON.** (The handful of home-copy strings
are borderline, but they're short, singular, and edited rarely — not worth
moving.)

### Tier 2 — Taxonomy / skeleton → **structured (JSON/YAML), id-keyed**
The *shape* of the site: the phase/activity spine (ids, order `n`, `hue`,
`soft`, names, relationships) and the technique tag list (`id`, `name`,
`endorsed`). Small, stable, referenced by id from everywhere, needs referential
integrity. **Stays structured** — but **the prose currently mixed into it moves
out** (see Tier 3 and Decision 1).

### Tier 3 — Prose entities → **Markdown + frontmatter**
Anything a human writes in paragraphs:
- **Use cases** — already here. No change.
- **About pages** — already here. No change.
- **Per-phase / per-activity editorial prose** — `canon`, `editor.*` — *moves
  here from `phases.json`* (Decision 1).
- **Technique long-form** — when a technique grows past its one-line description
  into real explanation, it graduates to a Markdown file (Decision 2).

The frontmatter carries the structured handles (ids, foreign keys, flags); the
body carries the voice.

---

## 6. The "no database" insight

With no database, the build *is* the database. The mapping is exact:

| Database concept | This project's equivalent |
|---|---|
| Tables | The content stores (`usecases/`, `phases.json`, `techniques.json`) |
| Rows | One Markdown file / one JSON array entry |
| Columns | Frontmatter keys / JSON fields |
| Rich-text column | The Markdown body |
| Primary keys | `id` (`u-research`, `d-sensing`, `t-evals`) |
| Foreign keys | `phase`, `activity`, `techniques[]` references |
| Query engine | `loadContent()` and its reverse indexes |
| Schema / constraints | **Missing today — add a build-time validation gate** |

The only missing piece is the **constraint layer**. That's Decision 3: a small
validation pass at the top of the build that fails loudly when an `id` collides,
a foreign key doesn't resolve, or a required field is absent. ~40 lines, no
dependency, and it converts a class of silent content bugs into a red build.

---

## 7. Decisions for the owner

The decision artifact presents each of these as an interactive card. Defaults =
the recommendation.

### Decision 1 — Where does the editorial prose in `phases.json` live?
- **A. Leave it in JSON strings.** Zero work; the pain persists.
- **B. (Recommended) Lift to Markdown.** Split `phases.json` into a lean
  *skeleton* (ids, order, hue, names, relationships) plus per-phase Markdown
  files (`content/phases/<id>.md`) whose frontmatter pins the structured handles
  and whose body holds canon + the editor's note in real Markdown. The loader
  joins them by id — exactly how use cases already work.
- **C. Markdown-in-frontmatter.** Keep one file per phase but stuff the prose
  into multi-line frontmatter blocks. Half-measure; still awkward for long prose.

### Decision 2 — How are techniques represented?
- **A. (Recommended) JSON now, Markdown when they grow.** Keep
  `techniques.json` as the lean tag list (`id`, `name`, `endorsed`,
  one-line `description`). The moment a technique needs real explanation,
  promote it to `content/techniques/<id>.md` and let the loader prefer the file.
  Matches the stated intent that techniques "cluster into a richer structure once
  patterns settle."
- **B. Move all techniques to Markdown now.** Consistent with Tier 3, but
  premature — most descriptions are still one line.
- **C. Keep techniques JSON-only, indefinitely.** Simplest; caps how rich a
  technique page can get.

### Decision 3 — Add a build-time validation gate?
- **A. (Recommended) Yes, now.** Unique ids, resolvable foreign keys, required
  frontmatter present → fail the build otherwise. Small, dependency-free,
  highest safety-per-line in the whole proposal.
- **B. Later.** Ship the file moves first, add the gate in a follow-up.
- **C. No.** Rely on review to catch broken references.

### Decision 4 — Adopt the guiding principle as a documented rule?
- **A. (Recommended) Yes** — write the "structured if you'd query it, Markdown
  if you'd read it" rule into the README/contributing notes so future content
  (and future Claude sessions) land in the right tier by default.
- **B. No** — decide case by case.

---

## 8. Recommendation

**1B + 2A + 3A + 4A.** Concretely:

1. Slim `phases.json` to a pure skeleton; move every prose field
   (`canon`, `editor.lead/body/points`) into `content/phases/<id>.md` with
   frontmatter handles, joined by id in `content.mjs` (mirrors use cases).
2. Keep `techniques.json` as the tag list; add an *optional* `content/techniques/<id>.md`
   override that the loader prefers when present.
3. Add `src/lib/validate.mjs`, called first in `build()`: unique ids, foreign-key
   resolution, required fields. Red build on violation.
4. Document the principle and the three tiers in the README.

This keeps every win the current model has (use-case frontmatter, the
`loadContent` query layer, fully relative/portable `dist/`), removes the one
real wound (prose-in-JSON), and adds the one missing safety net (constraints).

---

## 9. Migration path (low-risk, incremental)

1. **Add the validation gate first** against *today's* content — establishes the
   safety net before anything moves, and immediately surfaces any existing
   broken references.
2. **Migrate one phase** (`discover`) end to end: skeleton entry + `discover.md`,
   teach the loader the join, confirm byte-identical rendered output.
3. **Migrate the remaining phases**, then delete the prose fields from
   `phases.json`.
4. **Add the technique-Markdown override** (loader change only; zero content
   churn until a technique actually needs it).
5. **Write the README section.**

Each step is independently shippable and independently reversible; rendered HTML
should not change until we *want* it to (richer technique pages).

---

## 10. Future: when does a real database earn its place?

Triggers that would justify graduating from files to a DB: per-user state
(saved/endorsed-by-me), contributions written *through the site* instead of via
PR, full-text search at scale, or multi-editor concurrent writes. **None are on
the table now.** The point of choosing the frontmatter+id model today is that the
migration is mechanical when that day comes: **frontmatter → columns, Markdown
body → a rich-text column, `id` → primary key, the reference fields → foreign
keys.** We are not trading future flexibility for present simplicity — the model
is the same shape at both scales.

---

## 11. Open questions for the owner

- Is the home-page microcopy in `site.json` worth moving to Markdown, or is it
  fine as config strings? (PRD assumes: leave it.)
- Should `content/pages/*.html` (Master PRD, IA Proposal, and now this decision
  doc) be considered part of the data layer at all, or treated as standalone
  artifacts outside it? (PRD assumes: outside it.)
- Any appetite for YAML over JSON for the skeleton files (comments + less
  punctuation noise), or keep JSON for tooling familiarity?
