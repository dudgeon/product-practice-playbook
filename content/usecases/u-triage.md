---
id: u-triage
title: Agentic Slack triage that flags real customer signal across 30 channels
phase: grow
activity: g-ops
featured: true
endorsed: false
techniques:
  - t-subagents
  - t-mcp
tools:
  - Claude Code
  - Slack
  - MCP
author: Northstar Squad
metric:
  label: Time saved
  value: 52 hrs/week
prompt: |-
  # pass 1 — classify each message standalone
  for msg in messages:
      label = classify(msg)   # signal | noise | escalate

  # pass 2 — summarize only the kept set
  digest = summarize([m for m, l in pairs if l != "noise"])
links:
  - label: support-triage skill
    url: github.com/example/support-triage
  - label: Internal launch memo
    url: example.com/memo
---
## Goal

A support team monitored 30 Slack channels — roughly 60 hours/week of triage, most of it skimming routine chatter for the few real customer issues.

## Approach

A scheduled subagent pulls the last 15 minutes from each channel, classifies every message as signal / noise / escalate, and writes a markdown digest. A second pass summarizes only the signal set and posts escalations to a dedicated channel.

## Impact

Triage dropped from ~60 hrs/week to ~8. Three weeks running with zero missed escalations against a control sample.
