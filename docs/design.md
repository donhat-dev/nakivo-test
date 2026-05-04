# Frontend Design

## Purpose

This file is the agent-facing frontend design contract for UI work in this repo.
It is not a full design system. Product architecture and implementation rules live in `docs/conventions.md`.

## Design intent

- Build a calm, professional SaaS portal that still feels at home inside Odoo.
- Keep the UI modern and polished, but not startup-flashy or marketing-heavy.
- Prefer clarity, hierarchy, and consistent tokens over visual novelty.
- Bias toward light mode, soft contrast, and business-oriented density.

## Theme & atmosphere

### Keywords

- clean
- trustworthy
- quietly premium
- product-like
- structured
- portal-native

### Avoid

- neon dashboards
- heavy gradients
- glassmorphism
- playful blob illustrations
- oversized consumer-app radii
- dark mode by default

## Color palette & roles

| Token         | Value     | Role                                                            |
| ------------- | --------- | --------------------------------------------------------------- |
| Primary       | `#714B67` | Main CTA, active controls, key highlights                       |
| Primary Hover | `#5E3F56` | Hover / pressed state for primary actions                       |
| Primary Soft  | `#F1EAEE` | Tinted backgrounds, selected chips, subtle emphasis             |
| Accent        | `#00A09D` | Secondary highlight, success-adjacent emphasis, focused details |
| Accent Hover  | `#008784` | Hover / active accent state                                     |
| Accent Soft   | `#E5F7F6` | Accent-tinted badges, soft info surfaces                        |
| Background    | `#F8F6F8` | Page canvas                                                     |
| Surface       | `#FFFFFF` | Cards, forms, floating content surfaces                         |
| Surface Alt   | `#F4EFF3` | Nested sections or soft alternate surfaces                      |
| Text          | `#2F2630` | Primary text                                                    |
| Muted         | `#6F6470` | Secondary text, helper copy, metadata                           |
| Border        | `#E8DEE6` | Default borders and dividers                                    |
| Success       | `#1D8A5B` | Positive status                                                 |
| Warning       | `#B7791F` | Warning status                                                  |
| Danger        | `#C44E63` | Destructive state, errors                                       |

### Color rules

- Use `Primary` as the dominant brand anchor.
- Use `Accent` sparingly; it should support, not compete with, the primary color.
- Prefer white surfaces on the off-white page background.
- Keep count badges and passive chips neutral unless they carry semantic meaning.
- Never combine multiple saturated accents in the same component.

## Typography rules

### Font stack

`Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Type scale

| Token          | Size / Weight / Line Height | Usage                                       |
| -------------- | --------------------------- | ------------------------------------------- |
| Display        | `48px / 700 / 1.05`         | rare hero, page intro, empty-state headline |
| Page Title     | `32px / 700 / 1.15`         | main page title                             |
| Section Title  | `24px / 600 / 1.20`         | card groups, major sections                 |
| Card Title     | `20px / 600 / 1.25`         | card headings, form panels                  |
| Body           | `16px / 400 / 1.50`         | default text                                |
| Body Small     | `15px / 400 / 1.50`         | supporting copy in dense layouts            |
| Label / Button | `14px / 500 / 1.40`         | labels, actions, tabs                       |
| Caption        | `12px / 400 / 1.40`         | metadata, helper text                       |

### Typography rules

- Headings should stay between `32px` and `48px` for top-level emphasis.
- Default body text should stay in the `15px` to `16px` range.
- Avoid ultra-light weights.
- Prefer sentence case, not all caps.
- Keep letter spacing neutral; this UI should read crisp, not editorial-experimental.

## Spacing, radius, and sizing

### Spacing scale

- Base grid: `8px`
- Tokens in use: `4`, `8`, `12`, `16`, `24`, `32`, `40`, `48`

### Radius scale

- Cards: `12px`
- Inputs: `8px`
- Buttons: `8px`
- Pills / badges: `999px`

### Sizing rules

- Inputs and buttons should usually target `40px` to `44px` height.
- Card padding should default to `24px` on desktop and `16px` on mobile.
- Avoid crowded edge spacing; content should breathe inside each card.

## Layout principles

- Respect the existing Odoo portal shell and container rhythm.
- Prefer Bootstrap utilities before adding custom CSS.
- Use a clean two-zone layout on desktop when helpful: secondary panel + primary content area.
- Keep each view focused on one primary task.
- Prefer cards, lists, and simple tables over highly dense enterprise grids.
- Use whitespace to separate concerns before introducing extra color.

## Component styling

### Buttons

- Primary button: filled `Primary`, white text, darker hover.
- Secondary button: white or surface background with border and primary text.
- Tertiary button: text-only or ghost style.
- Destructive actions should use `Danger`, but not dominate the page.

### Inputs and forms

- Inputs use white background, `1px` border, `8px` radius.
- Focus state should use a visible tinted ring or stronger border.
- Labels sit above controls.
- Helper text and validation copy use `Muted` or semantic status colors.
- Forms should stay one column on mobile and max two columns on desktop.

### Cards and panels

- Cards use `Surface`, `12px` radius, subtle border, and restrained shadow.
- Border-first, shadow-second.
- Titles should be obvious; supporting metadata should be quiet.
- Loading, error, and empty states should render inside the same surface system.

### Tabs and segmented navigation

- Use rounded pills or understated segmented controls.
- Active state may use `Primary` fill or `Primary Soft` background with primary text.
- Badge counts should remain simple and neutral unless carrying semantic urgency.

### Badges and status indicators

- Use pill radius.
- Prefer soft tinted backgrounds instead of fully saturated fills.
- Map status consistently: success, warning, danger, neutral.

### Tables and record lists

- Desktop can use simple rows or cards depending on density.
- Mobile should collapse toward stacked cards.
- Keep actions visible at the trailing edge.
- Prioritize human-readable labels over raw IDs or system-heavy metadata.

## Elevation and borders

- Default depth should be subtle.
- Recommended card shadow style:
  - `0 1px 2px rgba(47, 38, 48, 0.04)`
  - `0 8px 24px rgba(47, 38, 48, 0.06)` for slightly lifted surfaces
- Use `Border` for most structure.
- Avoid dramatic shadows, blurred glows, or floating-glass aesthetics.

## Responsive behavior

| Breakpoint | Target behavior                              |
| ---------- | -------------------------------------------- |
| `1280px+`  | comfortable desktop layout, multi-panel okay |
| `1024px`   | reduce horizontal density, keep cards roomy  |
| `768px`    | shift to single-column content flow          |
| `480px`    | compact mobile spacing, stacked actions      |

### Responsive rules

- Keep minimum touch targets around `44px`.
- Allow tab rows to wrap or scroll horizontally when needed.
- Avoid side-by-side form controls on narrow screens.
- Preserve hierarchy before preserving exact layout.

## Accessibility and content

- Maintain clear contrast between text and surfaces.
- Never rely on color alone to communicate state.
- Keep copy concise and action-oriented.
- Use visible focus states.
- Prefer static translatable strings that fit Owl/Odoo workflows.

## Do and do not

### Do

- use `#714B67` as the main anchor color
- use `#00A09D` as a controlled accent, not a competing primary
- keep surfaces bright, soft, and uncluttered
- design for portal usability before visual flair
- keep custom CSS restrained and token-driven

### Do not

- introduce dark mode unless explicitly requested
- use gradients as a default design language
- mix multiple strong accents in the same view
- push border radius above `16px` except for pills
- redesign global Odoo chrome when the task only affects portal content

## Agent prompt guide

Use this shorthand when asking an AI agent to generate frontend work:

> Build a clean Odoo-adjacent SaaS portal UI with Inter, an off-white canvas, white cards, primary color `#714B67`, accent `#00A09D`, `12px` cards, `8px` inputs, subtle border-first elevation, and calm professional density.

When generating frontend code for this repo:

1. read `docs/conventions.md` for product and architecture constraints
2. keep the layout compatible with Odoo portal pages
3. prefer Bootstrap utilities before custom CSS
4. keep components Owl- and QWeb-friendly
5. follow these design tokens unless a task explicitly overrides them
