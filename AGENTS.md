# AGENTS.md

This repository is currently organized around two Odoo 19 Community addons:

- `nakivo_base_rest/` — shared generic REST primitives
- `nakivo_reseller_portal/` — reseller portal business implementation

## Start here

- Read `docs/conventions.md` for architecture, scope, and known implementation gaps.
- Read `DESIGN.md` before changing frontend layout, styling, Owl UI, or component look and feel.
- Read `docs/api.md` before changing controller contracts or frontend data flows.
- Read `docs/security.md` before touching models, record rules, portal routes, or any `sudo()` path.
- Read `docs/ai-usage.md` only if you need process context.
- Scoped file instructions live in `.github/instructions/`.

## Current repo shape

- Keep shared REST foundation code under `nakivo_base_rest/`.
- Keep reseller-specific business and frontend code under `nakivo_reseller_portal/`.
- Keep the solution Odoo-native: Python ORM, controllers, XML/QWeb, Owl assets.
- Do not move portal-specific behavior into `nakivo_base_rest/`.

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
- Do not call `cr.commit()` or `cr.rollback()` manually unless you created your own cursor.

## Portal integration rules

Every controller change that adds or modifies portal-visible data must verify:

- `_prepare_home_portal_values` is overridden to inject the relevant counter key when the
  user is a reseller portal member. Counter keys drive badge display on `/my/home`.
- A template extending `portal.portal_my_home` injects a `portal_docs_entry` for the
  reseller dashboard shortcut. See `docs/conventions.md` for the required pattern.
- Portal page routes use `website=True`; pure JSON API routes should omit it when
  the website middleware adds no value.
- GET-only routes use `readonly=True` to skip the savepoint overhead.
- GET and POST actions are declared in separate route methods, not branched inside one
  decorated method.

## Backend view rules

Any model field that should be visible or editable in the back office **must** have a view
extension in `views/<model>_views.xml`. Required views that are currently missing:

- `res.partner` form: `is_reseller` checkbox; `reseller_partner_id` on customer forms
- `crm.lead` form: `reseller_partner_id` field
- `sale.order` form: `reseller_partner_id` field
- `account.move` form: `reseller_partner_id` field (customer invoices only)
- A dedicated Resellers list view / menu item (partners where `is_reseller = True`)

All view files follow the naming pattern `<model>_views.xml` and live in `views/`.

## Reseller management rules

- `is_reseller` belongs on `res.partner` — it is a data-layer flag, not a user attribute.
- Do not add `is_reseller` to `res.users`.
- A reseller needs two things to access the portal: `is_reseller = True` on their partner,
  and their linked `res.users` account must be in `group_reseller_portal_user`.
- The standard Odoo "Grant portal access" wizard creates the portal user; adding to the
  reseller group is a second step. Future work: atomic onboarding action on the partner form.

## Frontend rules

- Use Owl components with XML templates; avoid inline templates except for trivial experiments.
- Template names should follow `nakivo_reseller_portal.ComponentName`.
- Register JS, XML, and SCSS in `__manifest__.py` assets; portal UI belongs in `web.assets_frontend`.
- Prefer Odoo services and hooks over raw global listeners.
- Keep shared state centralized; avoid duplicating fetched server data across components.
- Use `_t` for translatable JS strings and keep those strings static.

## Naming and file conventions

- Use lowercase underscore filenames.
- Prefer controller files like `nakivo_reseller_portal.py` or `portal.py`; do not introduce new `main.py` files.
- Use `*_views.xml` for backend views and `*_templates.xml` for QWeb/portal templates.
- Keep security files split by concern: `ir.model.access.csv`, `<module>_groups.xml`, `<model>_security.xml`.
- Keep tests under `tests/` and import test modules from `tests/__init__.py`.

## Working style

- Make minimal diffs and preserve surrounding style.
- Link to docs instead of duplicating long rationale inside code comments or instructions.
- If API, security, architecture, or frontend design rules change, update the matching file in `docs/` in the same change.
- If the repo grows clear hotspots later, add scoped `AGENTS.md` files under those folders instead of bloating this file.
