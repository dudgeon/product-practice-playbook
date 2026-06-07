---
id: u-spec-decomp
title: >-
  Spec-decomposer: a one-page PRD into a tracked engineering plan with seeded
  subtasks
phase: build
activity: b-decisions
featured: false
endorsed: false
techniques:
  - t-structured
  - t-skills
tools:
  - Claude Code
  - Jira
  - MCP
author: Delta Velocity
---
## Goal

The handoff from a one-page PRD to a tracked engineering plan was a half-day exercise that often missed dependencies.

## Approach

A skill reads the PRD, classifies each requirement (api / ui / data / ops), and generates Jira-formatted subtasks with proposed owners and a draft dependency graph — as markdown a human pastes in.

## Impact

Decomposition dropped from a half-day to ~30 minutes. Two teams adopted it in their first review.
