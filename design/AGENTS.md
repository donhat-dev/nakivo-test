---
description: "Use when working under `design/**`. Keeps standalone design-demo folders organized around named design personas, with persona-first workflow and taste-skill-driven implementation."
applyTo: "design/**"
---

# Design Workspace Instructions

The `design/` folder is a standalone exploration workspace for frontend design demos.
It is intentionally separate from the Odoo addons and from the production portal UI.

## Relationship to Project Design Conventions

Design demos under `design/` **must not** follow `DESIGN.md` as a binding convention.
`DESIGN.md` governs the current Odoo-native production portal experience; `design/` contains
proposed future directions and may intentionally explore different palettes, typography,
layout density, interaction models, and visual systems.

When working in `design/`, treat the selected persona and taste-skill output as the design
source of truth. Only use `DESIGN.md` as background context if the user explicitly asks to
align a proposal with the current production portal.

## Purpose

- Store one or more static/demo web experiences based on named design personas.
- Use demos to explore visual direction, interaction patterns, page structure, and frontend stack choices.
- Keep design experiments isolated so they do not change Odoo addon contracts, Owl assets, backend routes, or production styles by accident.

## Required Workflow

Every new design demo must follow this order:

1. Generate or select a design persona first.
2. Use that persona as the source of truth for naming, layout, typography, color, motion, and component behavior.
3. Pick the relevant taste/design skill only after the persona is fixed.
4. Generate or modify the demo page to match the persona.
5. Verify the demo locally with build/lint and, when practical, screenshots across desktop and mobile.

Do not start a new demo by writing UI code first. The persona comes before implementation.

## Persona Rules

- Use the `gen-design-persona` skill when the user asks for a new direction, style rename, codename, or design persona.
- Persona codenames must be treated as stable folder names unless the user explicitly renames them.
- Prefer folder names that exactly match the persona codename, for example:
  - `design/onyx-signal-768/`
  - `design/raw-terminal-787/`
  - `design/mono-frame-456/`
- Each demo folder should include a `README.md` that records:
  - persona codename
  - short style summary
  - stack
  - run/build commands
  - any intentional constraints, such as `border-radius: 0`, light mode only, or mono typography

If the user already provides a persona/codename, do not regenerate it unless they ask for a new one.

## Production-Ready Demo Content

All visible demo content must be written as if the page is a production-ready product page
or product interface shaped by the selected persona. The UI copy, data labels, navigation,
empty states, CTAs, metrics, and section headings must belong to the persona's product world.

Do not put process, chat, or repository context into the visible UI. Avoid copy such as:

- "This demo stays inside `design/`"
- "Prototype without touching production"
- "Mock data"
- "Before Owl, QWeb, controller, or model contract changes"
- "Conversation context"
- "Future interface language"
- Any explanation of why the demo exists, how it was generated, or where it lives in the repo

Those implementation/process details may appear in `README.md`, comments, or final assistant
responses when useful, but not in the rendered product experience.

Use case framing is allowed only when it reads like real product content. For example, a partner
portal demo may discuss pipeline coverage, partner health, renewals, co-sell motion, account
ownership, enablement progress, or margin risk. It should not discuss Codex, chat prompts, design
folders, Odoo implementation safety, or internal experimentation workflow.

## Prisoner's Dilemma Design Isolation

Each design persona/demo must behave like an independent proposal in a Prisoner's Dilemma:
it should not inspect all existing designs and average them into a safer consensus.
The design idea must be unique to its persona and created from the current product context,
current brief, and selected taste-skill.

The payoff model is strict:

- Best outcome for one persona: it takes the current brief and produces the strongest distinct proposal for itself.
- Best outcome for all personas: every persona has its own clear design thesis, so the design set becomes a useful option portfolio.
- Bad outcome: a new persona copies another persona's layout, palette, component rhythm, motion idea, content angle, or visual metaphor.
- Worst outcome: copying makes both the new design and the prior design less valuable because their differences become unclear.

Existing demos may be used only as limited reference for:

- repository folder shape
- package setup
- shadcn/ui wiring
- TanStack Query mock-data patterns
- Tailwind or motion-library implementation mechanics
- build/lint/verification commands

Do not use existing demos as a visual base, mood board, component style source, palette source,
layout template, typography model, content thesis, or interaction concept unless the user explicitly
asks for a variant of that exact persona. If a new demo starts to resemble another demo, stop and
sharpen the persona until the idea is distinct.

When checking existing folders, look only far enough to avoid duplicate codenames and to reuse
implementation mechanics. Do not browse previous designs deeply for inspiration unless the task is
explicitly a comparison, audit, or variant request.

## Taste-Skill Rules

After the persona is fixed, choose the taste/design skill that best matches it.

- Use `gpt-taste` for high-motion, editorial, premium SaaS demos with GSAP and cinematic section structure.
- Use `industrial-brutalist-ui` for tactical, raw, sharp, grid-heavy, telemetry, blueprint, or terminal-inspired demos.
- Use `minimalist-ui`, `high-end-visual-design`, `redesign-existing-projects`, or other available design skills only when the persona clearly calls for them.
- If multiple skills could apply, use the smallest set that preserves the persona.

The selected taste skill must serve the persona. Do not let a skill override explicit persona constraints.

## Demo Folder Shape

Prefer one self-contained app per persona folder:

```text
design/<persona-codename>/
├── README.md
├── package.json
├── index.html
├── src/
├── public/
└── ...tooling files
```

Generated artifacts such as `node_modules/`, `dist/`, screenshots, and temporary verification output should remain untracked unless the user explicitly asks to keep them.

## Implementation Rules

- Keep demos static or mock-data driven unless the user asks for real backend integration.
- Do not call Odoo controllers or reuse authenticated production routes from demos.
- Use React + Vite + TanStack Query + Tailwind + shadcn/ui as the default required stack for code-based design demos.
- Use Motion, GSAP, Framer Motion, or another motion library only when the selected taste-skill/persona needs it. Motion tooling should support the concept, not decorate it randomly.
- Do not use Owl, QWeb, Bootstrap-first Odoo assets, or Odoo portal frontend conventions for standalone demos unless the user explicitly asks to productize the concept inside the Odoo addon.
- Keep demo-specific helpers, components, and assets inside that demo folder.
- Do not move portal-specific business logic or shared REST code into `design/`.
- Do not change `nakivo_base_rest/` or `nakivo_reseller_portal/` to support a design demo unless the user explicitly asks to productize the concept.

## Visual Consistency

- Match the persona exactly before adding extra polish.
- Respect hard constraints such as light/dark substrate, font family, sharp corners, density, and primary color.
- Avoid generic SaaS defaults unless the persona explicitly calls for them.
- Avoid mixing unrelated personas inside one demo folder.
- If a demo evolves into a new visual direction, generate a new persona and create a new folder instead of silently mutating the old direction.

## Verification

For code-based demos, run the relevant local checks before finishing:

- `npm run build`
- `npm run lint` when available
- screenshot or browser verification when layout, motion, or responsiveness matters

If a check cannot run because dependencies are missing or the environment blocks a browser tool, state that clearly in the final response.
