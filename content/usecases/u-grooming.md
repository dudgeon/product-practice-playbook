---
id: u-grooming
title: >-
  Backlog grooming agent: an overnight pass that re-tags, dedupes, and ranks
  stale tickets
phase: grow
activity: g-ops
featured: false
endorsed: false
techniques:
  - t-subagents
tools:
  - Claude Code
  - Jira
  - MCP
author: Delta Velocity
---
## Goal

1,400+ stale tickets accumulated over years. Manual grooming never made a dent.

## Approach

An overnight subagent runs each old ticket through dedupe, tag normalization, owner inference, and a relevance check — then lands results in a review queue. It never closes tickets; humans close from the queue.

## Impact

Trimmed the backlog from 1,400 to 420 in three weeks of morning reviews. Eng leads look at the backlog again.
