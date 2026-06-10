---
id: u-context-pack
title: 'A platform context pack agents load on session one: AGENTS.md beyond the repo'
track: platform
enabler: e-context-pack
featured: false
endorsed: false
techniques:
  - t-context
  - t-mcp
tools:
  - Claude Code
  - GitHub
author: Meridian Platform Group
metric:
  label: Time to first integration
  value: 3w → 4d
---
## Goal

Every consumer team's agent asked the support channel the same twenty questions — how access works, which environment is which, what the deploy path is, who owns what. The answers lived in onboarding decks and senior engineers' heads, so the platform team had become the human context window for everyone else's automation.

## Approach

Published a context pack at one stable path: a plain-Markdown map of the architecture, the golden-path walkthrough from access request to first deploy, the support model with explicit escalation rules ("when to stop and page a human"), and a directory of the services the platform owns. The pack versions with platform releases — a release check fails when it lags — and consumer teams point their agents at it from their own CLAUDE.md.

## Impact

Time to first integration dropped from about three weeks to four days, and repeat questions in the support channel roughly halved. The pack quietly became the onboarding doc for humans, too.
