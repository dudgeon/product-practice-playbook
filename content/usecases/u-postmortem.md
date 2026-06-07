---
id: u-postmortem
title: >-
  Postmortem-as-conversation: an agent that interviews the on-call and drafts a
  calibrated writeup
phase: grow
activity: g-iterate
featured: false
endorsed: false
techniques:
  - t-prompt
tools:
  - Claude Code
  - skill
author: Helios Platform
---
## Goal

Postmortems were either thin (rushed by the on-call) or never written at all.

## Approach

An interview-style agent asks the on-call structured questions, drafts the writeup, then asks them to confirm specific factual claims. It is calibrated to be curious about systems, never to blame people.

## Impact

Postmortem completion rose from 60% to 95%. The platform team reports they’re noticeably better.
