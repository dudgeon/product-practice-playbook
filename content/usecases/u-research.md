---
id: u-research
title: 'Parallel subagents for competitive research: 8× faster intelligence gathering'
phase: discover
activity: d-sensing
featured: false
endorsed: false
techniques:
  - t-subagents
  - t-multiagent
tools:
  - Claude Code
  - subagent
author: Orbital Insights
metric:
  label: Cycle time
  value: 2.5d → 4h
prompt: |-
  ---
  competitor: <id>
  source_type: <press|changelog|jobs|pricing>
  date_observed: <iso>
  signal_strength: <low|medium|high>
  ---
links:
  - label: comp-intel-orchestrator
    url: github.com/example/comp-intel
---
## Goal

Quarterly competitive sweeps took a researcher 2–3 days of switching between sources and reconciling overlapping mentions — half of it tab management.

## Approach

Eight parallel subagents, each scoped to one source, write findings to a shared directory using a strict frontmatter schema. A synthesizer reads the whole tree and produces the executive brief.

## Impact

Cycle time on the quarterly brief dropped from 2.5 days to about 4 hours of human curation.
