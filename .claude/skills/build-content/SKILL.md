---
name: build-content
description: >-
  Recompile and validate the playbook's content artifacts when the product
  lifecycle changes. Use when content/lifecycle.json is edited — stages or key
  activities added, renamed, reordered, or recolored — or before building the
  site, to regenerate content/phases.json and confirm every use case still
  places onto a real stage and activity.
allowed-tools: Bash(npm run build-content:*) Bash(node scripts/build-content.mjs:*)
---

The product lifecycle — the **stages and their key activities** — lives in
`content/lifecycle.json`. That file is the single source of truth for the spine.
This skill compiles it into the content artifacts the site renders from and
validates the rest of the content store against it.

1. If the user described a lifecycle change, edit `content/lifecycle.json` to
   match (add / rename / reorder / recolor entries under `phases[]`, each with
   `activities[]`).
   - **Keep existing `id`s stable** — use cases reference them by id. Only set a
     new `id` for a genuinely new stage/activity; omit `id` to auto‑slug it from
     the name.
   - `hue` is optional (auto‑assigned from a palette if omitted); `soft` tint and
     the phase number (`n`) are derived automatically.
2. Run `npm run build-content`.
3. Report the coverage summary. **If validation fails**, it is almost always a
   use case in `content/usecases/*.md` whose `phase` / `activity` frontmatter
   points at a stage that was renamed or removed — update that frontmatter (or
   the lifecycle) and re‑run until it's green.

Do **not** hand‑edit `content/phases.json` — it is generated from
`content/lifecycle.json` and git‑ignored. Edit the lifecycle, not the snapshot.
