---
id: u-pr-reviewer
title: >-
  PR reviewer agent: a calibrated second pair of eyes that focuses humans on
  what matters
phase: build
activity: b-review
featured: false
endorsed: false
techniques:
  - t-subagents
  - t-evals
tools:
  - Claude Code
  - GitHub
  - MCP
author: Helios Platform
metric:
  label: Review time
  value: −50%
---
## Goal

Code reviews ate senior engineers’ afternoons, mostly on style and small correctness issues that could be caught earlier.

## Approach

An agent runs on every PR and produces three sections — mechanical, risk, and unsure. Seniors focus on risk and unsure; the team self-resolves mechanical. It comments only, never approves.

## Impact

Senior-engineer review time per PR halved. Defect rate held steady.
