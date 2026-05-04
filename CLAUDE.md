# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key documentation to read first

Before making changes, read the relevant doc(s) in `docs/`:

- `docs/conventions.md` — architecture, scope, and implementation rules
- `docs/api.md` — endpoint contracts and payload design
- `docs/security.md` — trust boundary, threat model, and forbidden patterns
- `DESIGN.md` — frontend visual contract (read before touching UI)

Scoped file-level instructions live in `.github/instructions/`.

## Addons

This repo contains two Odoo 19 Community addons:

- **`nakivo_base_rest/`** — generic REST primitives: request parsing, Pydantic validation, response envelopes, centralized exception mapping, and semantic error codes. Nothing reseller-specific lives here.
- **`nakivo_reseller_portal/`** — reseller portal: Owl frontend, controllers, models, security rules, and domain-specific error codes.

Keep the boundary strict: generic HTTP/validation primitives belong in `nakivo_base_rest`; domain semantics belong in `nakivo_reseller_portal`.

## Architecture

```
Portal user login
    ↓
GET /my  (portal home — reseller dashboard shortcut tile via _prepare_home_portal_values)
    ↓
GET /my/reseller-portal  (Odoo portal page, type='http')
    ↓
Odoo renders page shell → Owl SPA mounts
    ↓
Frontend calls authenticated JSON endpoints (type='http', not jsonrpc)
    ↓
Backend derives reseller from session → enforces ownership → returns envelope
```

API base path: `/api/v1/partner-portal/`. All controller responses use the standard envelope:

```json
{ "success": true,  "data": {}, "meta": {} }
{ "success": false, "error": { "code": 404, "name": "OPPORTUNITY_NOT_FOUND", "message": "..." } }
```

## Running the dev environment

```bash
cd docker
cp .env.example .env   # defaults work for local use
docker compose up -d   # Odoo on http://localhost:8069
```

Install addons into a fresh database:

```bash
docker compose run --rm odoo odoo \
    --config=/etc/odoo/odoo.conf \
    -d nakivo_crm \
    -i nakivo_base_rest,nakivo_reseller_portal \
    --stop-after-init
```

Tail logs:

```bash
docker compose logs -f odoo
```

## Running tests

```bash
docker compose run --rm odoo odoo \
    --config=/etc/odoo/odoo.conf \
    -d nakivo_crm_test \
    -i nakivo_reseller_portal \
    --test-enable \
    --stop-after-init
```

Tests use `@tagged("post_install", "-at_install")` and inherit `TransactionCase`.

## Quality checks

Install dev tooling once:

```bash
python3 -m pip install -r requirements-dev.txt
pre-commit install
```

Run all checks:

```bash
pre-commit run --all-files
```

Quick Python syntax validation:

```bash
python3 -m compileall nakivo_base_rest nakivo_reseller_portal
```

The toolchain runs: `ruff` (lint + format), `pylint-odoo` (two passes: optional `.pylintrc` and mandatory `.pylintrc-mandatory`), `prettier` (MD/YAML/XML/SCSS/JS), `eslint` (JS), and OCA addon checks.

## Security rules (non-negotiable)

- **Never** trust `reseller_id` or ownership values from client payloads.
- **Always** derive reseller scope from `request.env.user.partner_id`.
- **Always** apply a reseller domain filter before any `sudo()` read, write, or unlink.

Safe pattern:
```python
reseller = request.env.user.partner_id
records = request.env["crm.lead"].sudo().search([
    ("reseller_partner_id", "=", reseller.id),
])
```

Forbidden patterns:
```python
model.sudo().search([])                      # no scope filter
model.sudo().browse(record_id).unlink()      # no ownership check
reseller_id = payload.get("reseller_id")     # client-supplied scope
```

## Backend conventions

- Controllers should be thin; move reusable business logic to models.
- Use `ValidationError` or `UserError` for business failures; `BaseRestHandler` maps these to the API envelope.
- Wrap controller actions in `self._dispatch_api(lambda: ...)` for automatic exception mapping.
- Use `self._validate_payload(SchemaClass)` for Pydantic request validation.
- Pydantic models must use `extra='forbid'` unless a route explicitly needs loose input.
- Never call `cr.commit()` / `cr.rollback()` manually without a custom cursor.
- Add `readonly=True` to GET-only routes — skips the savepoint overhead (Odoo v17+ pattern).
- Do not branch GET and POST inside a single `@route` method; declare them as separate methods.

## Portal home integration

Every module contributing portal-visible data must override `_prepare_home_portal_values` and
provide a template extending `portal.portal_my_home`. This drives the shortcut tile and badge
count on `/my`. See `docs/conventions.md` — "Portal home integration" for the required pattern.

**Current gap**: this override is missing from `PartnerResellerPortalController`.

## Reseller identity

A reseller is a `res.partner` with `is_reseller = True` **plus** a linked `res.users` account in
`group_reseller_portal_user`. Keep `is_reseller` on `res.partner`, not `res.users`. The controller
resolves the reseller as `request.env.user.partner_id`.

## Backend views (current gap)

`is_reseller` and `reseller_partner_id` exist in the ORM but have no BO view extensions yet.
Before adding new model fields, add the corresponding view extension in `views/<model>_views.xml`.
A dedicated Resellers menu item (partners where `is_reseller = True`) is also missing.

## Frontend conventions

- Owl components with XML templates; template names follow `nakivo_reseller_portal.ComponentName`.
- Register JS, XML, and SCSS in `__manifest__.py` under `web.assets_frontend`.
- Name components after business concepts: `RecordCard`, `DashboardTabBar`, `StatusBadge` — not generic names like `Card`, `Tabs`, `Badge`.
- Use `_t` for translatable strings; keep them static.
- CSRF token must be sent from the portal page context for unsafe HTTP methods.

## Naming conventions

- Lowercase underscore filenames.
- Views: `*_views.xml`; QWeb templates: `*_templates.xml`.
- Security files: `ir.model.access.csv`, `<module>_groups.xml`, `<model>_security.xml`.
- Controller files: `nakivo_reseller_portal.py` or `portal.py` — no new `main.py` files.
