# AGENTS.md

This repository is currently organized around two Odoo 19 Community addons:

- `nakivo_base_rest/` — shared generic REST primitives
- `nakivo_reseller_portal/` — reseller portal business implementation

## Start here

- Read `docs/conventions.md` for architecture and scope.
- Read `docs/design.md` before changing frontend layout, styling, Owl UI, or component look and feel.
- Read `docs/api.md` before changing controller contracts or frontend data flows.
- Read `docs/security.md` before touching models, record rules, portal routes, or any `sudo()` path.
- Read `docs/ai-usage.md` only if you need process context.
- Scoped file instructions live in `.github/instructions/`.

## Current repo shape

- Keep shared REST foundation code under `nakivo_base_rest/`.
- Keep reseller-specific business and frontend code under `nakivo_reseller_portal/`.
- Keep the solution Odoo-native: Python ORM, controllers, XML/QWeb, Owl assets.
- Do not move portal-specific behavior into `nakivo_base_rest/`.
- No verified local run/test commands are committed yet; document them once the environment is pinned.

## Addon layout to follow

```text
nakivo_base_rest/
├── __init__.py
├── __manifest__.py
├── error_codes.py
├── exceptions.py
├── handler.py
└── schemas.py

nakivo_reseller_portal/
├── __init__.py
├── __manifest__.py
├── controllers/
├── models/
├── security/
├── static/src/partner_portal/
├── tests/
└── views/
```

Repository-level docs live under `docs/`.

## Backend rules

- Never trust reseller, ownership, or access-scope identifiers from frontend payloads.
- Resolve the acting user from `request.env.user` and related partner fields.
- Apply restrictive domains before any `sudo()` read, write, or unlink.
- Keep generic HTTP/validation/error primitives in `nakivo_base_rest/` and domain semantics in `nakivo_reseller_portal/`.
- Prefer ORM domains and record rules over raw SQL or ad-hoc Python filtering.
- Keep controllers thin; move reusable business logic to models when it grows.
- Use `ValidationError` or `UserError` for business failures.
- Do not call `cr.commit()` or `cr.rollback()` manually unless you created your own cursor for a justified reason.

## Frontend rules

- Use Owl components with XML templates; avoid inline templates except for trivial experiments.
- Template names should follow `nakivo_reseller_portal.ComponentName`.
- Register JS, XML, and SCSS in `__manifest__.py` assets; portal UI normally belongs in `web.assets_frontend`.
- Prefer Odoo services and hooks over raw global listeners.
- Keep shared state centralized; avoid duplicating fetched server data across components.
- Use `_t` for translatable JS strings and keep those strings static.

## Naming and file conventions

- Use lowercase underscore filenames.
- Prefer controller files like `nakivo_reseller_portal.py` or `portal.py`; do not introduce new `main.py` files.
- Use `*_views.xml` for backend views and `*_templates.xml` for QWeb templates.
- Keep security files split by concern: `ir.model.access.csv`, `<module>_groups.xml`, `<model>_security.xml`.
- Keep tests under `tests/` and import test modules from `tests/__init__.py`.

## Working style

- Make minimal diffs and preserve surrounding style.
- Link to docs instead of duplicating long rationale inside code comments or instructions.
- If API, security, architecture, or frontend design rules change, update the matching file in `docs/` in the same change.
- If the repo grows clear hotspots later, add scoped `AGENTS.md` files under those folders instead of bloating this file.
