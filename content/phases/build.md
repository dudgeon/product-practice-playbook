---
id: build
activities:
  b-design:
    canon: "Show a working artifact, not a description of one."
  b-review:
    canon: "A second reviewer sees every change before it ships."
    editor: "Calibrate the agent to comment, never to approve."
  b-decisions:
    canon: "Record the decision and the reason. Future-you is the audience."
  b-testing:
    canon: "Regressions are caught before release, not after."
---
## Canon

Every step produces a reviewable artifact. Decisions are recorded with their rationale. Quality gates precede release.

## Editor's note

The protocol asks for reviewable artifacts and recorded decisions. Agents happen to be unreasonably good at exactly that.

Drafting the spec, decomposing the plan, reviewing the PR, writing the eval — these are the load-bearing chores of Build, and they’re where teams see the most consistent leverage. The ones getting durable value share a few habits.

- **The agent proposes; a human commits.** Keep agents non-destructive — comment, draft, queue — never auto-merge or auto-close.
- **Record the decision and the reason, not just the diff.** The rationale is the artifact future-you actually needs.
- **Gate quality before release.** A 90-second eval beats a post-incident postmortem every time.
