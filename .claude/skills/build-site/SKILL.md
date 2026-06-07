---
name: build-site
description: >-
  Render the static playbook site from the content store (Markdown + JSON
  files) into dist/. Use when the user wants to build, regenerate, render, or
  preview the site after editing content, the lifecycle, or templates.
allowed-tools: Bash(npm run build:*) Bash(npm run serve:*) Bash(npm run dev:*)
---

Render the static site from the content (`content/**`) into `dist/` using the
templates/components in `src/`.

1. Run `npm run build`. This first compiles + validates the lifecycle (the
   build-content step), then renders every route to static HTML and writes the
   phase‑keyed CSS.
2. Report the page count and that the output is in `dist/`. If the content build
   reports a validation error, surface it — the content must be fixed before it
   can render (see the build-content skill).
3. To preview locally, run `npm run serve` and share http://localhost:8080
   (or `npm run dev` to build and serve in one step). The output is fully
   relative, so `dist/index.html` can also just be opened directly off disk.
