---
id: u-evals
title: >-
  A lightweight eval harness that catches 80% of prompt drift in a 90-second
  check
phase: build
activity: b-testing
featured: true
endorsed: true
techniques:
  - t-evals
  - t-hooks
tools:
  - Claude Code
  - eval
  - hook
author: Helios Platform
metric:
  label: Regressions caught
  value: 7 in 4 wks
---
## Goal

Prompt and skill regressions kept slipping into production. The team needed a no-fuss eval pattern that didn’t require a full ML pipeline.

## Approach

Each skill has an adjacent evals/ folder of YAML cases. A pre-commit hook runs them against the staged version in parallel and blocks on qualitative failures.

## Impact

Caught 7 regressions in the first four weeks that would otherwise have shipped. Adopted by 5 teams.
