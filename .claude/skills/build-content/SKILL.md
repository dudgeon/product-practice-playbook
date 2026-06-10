---
name: build-content
description: >-
  Recompile and validate the playbook's content artifacts when either spine
  changes. Use when content/lifecycle.json is edited — phases, subphases, or
  key activities added, renamed, reordered, or recolored — or when
  content/enablers.json is edited (tracks, areas, enablers), or before building
  the site, to regenerate content/phases.json + content/tracks.json and confirm
  every use case still places onto a real stage/enabler and every enabled_by
  reference resolves.
allowed-tools: Bash(npm run build-content:*) Bash(node scripts/build-content.mjs:*)
---

The site has **two spines with one shape** (root → mid → leaf):

- The product lifecycle — **phases › subphases › key activities** — lives in
  `content/lifecycle.json`.
- The enablement shelf — **tracks › areas › enablers** (agent-readiness
  expectations owned by data, platform & process, and product stewards) — lives
  in `content/enablers.json`. It is **emergent by design**: tracks may be flat
  (no `areas[]`; they compile as one implicit area) and grow areas only when
  enablers cluster. It is also **provisional**: no endorsements on this spine.

Each file is the single source of truth for its spine. This skill compiles both
into the content artifacts the site renders from and validates the rest of the
content store against them.

1. If the user described a spine change, edit the matching JSON file. The
   hierarchy is `phases[]` → `subphases[]` → `activities[]`, or `tracks[]` →
   `areas[]` → `enablers[]` (either root may use a flat leaf array; it compiles
   as one implicit mid group).
   - **Keep existing `id`s stable** — use cases place by activity id *or* by
     track + enabler id (the mid tier is derived), and lifecycle use cases may
     cite enabler ids in `enabled_by`. Only set a new `id` for a genuinely new
     entry; omit `id` to auto‑slug it from the name.
   - `hue` is optional (auto‑assigned from a palette if omitted); `soft` tint
     and the numbers (`n`) are derived automatically. Track and phase ids must
     not collide (validated).
   - Prose lives beside the skeleton: `content/phases/<id>.md` and
     `content/tracks/<id>.md` (canon + the editor's note; leaf-level lines in
     frontmatter keyed by activity/enabler id). A new phase or track needs its
     prose file.
2. Run `npm run build-content`.
3. Report the coverage summary (both spines). **If validation fails**, it is
   almost always a use case in `content/usecases/*.md` whose `phase`/`activity`
   (or `track`/`enabler`, or `enabled_by`) frontmatter points at something
   renamed or removed — update that frontmatter (or the spine) and re‑run until
   it's green. A use case must sit on exactly **one** spine.

Do **not** hand‑edit `content/phases.json` or `content/tracks.json` — they are
generated and git‑ignored. Edit the spine files, not the snapshots.
