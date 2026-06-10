---
id: data
enablers:
  e-data-dictionary:
    canon: "Publish the dictionary where an agent can fetch it, in a shape it can parse."
    editor: "Versioned YAML beside the schema beats a beautiful wiki page every time."
---
## Canon

Your data is an interface, and anyone's agent may be a caller. Every dataset you own should be discoverable, machine-readable, and addressable — described well enough that a stranger's agent uses it correctly without you in the room.

## Editor's note

Data owners have always owed the org documentation. What's new is who reads it.

An agent doesn't skim, ask a teammate, or guess politely — it either parses your metadata or invents its own. Every undescribed column is an invitation to a confident wrong answer, repeated by every team that points an agent at your tables. The fix is rarely more prose; it's prose in a parseable shape, at a stable address, kept current.

- **Ship the dictionary as data.** YAML or JSON beside the schema, versioned with it — not a PDF, not a screenshot, not tribal knowledge.
- **Register, don't announce.** A catalog entry outlives the launch deck; discoverability is a property, not an event.
- **Freshness is part of done.** A schema change isn't finished until the description moves with it — and says when it moved.
