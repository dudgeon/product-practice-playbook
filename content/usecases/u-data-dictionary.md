---
id: u-data-dictionary
title: >-
  Data dictionary as versioned YAML: downstream agents stop guessing column
  semantics
track: data
enabler: e-data-dictionary
featured: false
endorsed: false
techniques:
  - t-structured
  - t-retrieval
tools:
  - GitHub
  - MCP
author: Caldera Data Guild
metric:
  label: Agent retrieval misses
  value: −40%
---
## Goal

Five downstream teams pointed agents at the same warehouse tables, and each re-derived what the columns meant from samples and tribal knowledge. Two shipped the same wrong join. A dictionary existed — as a wiki page, last touched 14 months ago, unreadable to anything without eyes.

## Approach

Moved the dictionary to YAML beside the schema in the owning repo — one entry per column: meaning, unit, nullability quirks, deprecation status, and a worked join example. Registered the dataset in the catalog at a stable address, added a CI check that fails any schema change that doesn't move the dictionary with it, and exposed the whole thing read-only over MCP so a session can fetch the entry it needs on demand.

## Impact

Downstream agents now cite dictionary entries instead of inventing semantics. Retrieval misses — agent answers contradicting the dictionary — fell about 40% in the first month, and two teams deleted their private "what the columns actually mean" notes.
