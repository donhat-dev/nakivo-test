---
description: "Use when editing project docs in `docs/`. Keeps design, API, security, and AI-process docs stable, cross-linked, and detached from transient chat prompts."
applyTo: "docs/**/*.md"
---

- Treat `docs/` as the durable project context; do not paste transient prompt text verbatim.
- Rewrite temporary chat context into stable repository decisions, assumptions, or open questions.
- Keep docs concise and cross-linked:
  - architecture and implementation rules belong in `conventions.md`
  - frontend visual rules for agents belong in `design.md`
  - endpoint contracts belong in `api.md`
  - trust boundaries and controls belong in `security.md`
- When a change crosses design, API, and security boundaries, update all affected docs in the same change.
- Clearly label assumptions or open questions instead of presenting them as implemented facts.
- Prefer local links over duplicated explanation blocks.
