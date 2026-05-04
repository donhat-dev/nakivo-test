# Project Conventions

## Purpose

This file captures project-level architecture, scope, and implementation conventions.
Shared generic REST primitives live in the standalone `base_rest_api` addon.

## Product goal

Build an authenticated reseller portal on Odoo 19 Community Edition with an Odoo-native stack:

- portal page rendered by Odoo
- Owl frontend mounted inside the portal page
- authenticated controller endpoints for portal data and actions
- backend-enforced reseller data isolation

## Current implementation direction

The repository is currently oriented around two addons:

- `base_rest_api` for shared generic REST primitives
- `partner_reseller_portal` for reseller-specific business logic and portal UI

### Chosen stack

- **Shared API foundation:** standalone `base_rest_api` addon with Pydantic-first generic REST primitives
- **Backend:** Odoo ORM, controllers, XML/QWeb
- **Frontend:** Owl components, XML templates, SCSS, Odoo asset bundles
- **Authentication:** existing Odoo session and portal login flow
- **Authorization gate:** dedicated reseller portal group layered on top of portal authentication
- **Deployment model:** two related addons inside one Odoo instance
- **API transport:** authenticated Odoo `type='http'` routes returning JSON responses

### Explicit non-goals for the first iteration

- separate React/Vue SPA
- generic REST utilities embedded directly inside the reseller addon
- SEO-oriented public website behavior
- feature-rich UI beyond basic portal usability
- broad cross-module abstractions before the main flow works

## Architectural outline

```text
Portal user login
    ↓
Open /my/reseller-portal
    ↓
Odoo renders the page shell
    ↓
Owl app mounts in the portal content area
    ↓
Frontend loads reseller-scoped dashboard data
    ↓
Frontend calls authenticated HTTP JSON endpoints for read/create/delete actions
    ↓
Backend resolves current reseller from session and enforces ownership
```

## Expected addon structure

```text
base_rest_api/
├── __init__.py
├── __manifest__.py
├── error_codes.py
├── exceptions.py
├── handler.py
└── schemas.py

partner_reseller_portal/
├── __init__.py
├── __manifest__.py
├── controllers/
├── models/
├── security/
├── static/src/partner_portal/
├── tests/
└── views/
```

## Data model direction

The current plan assumes a `reseller_partner_id` field on the main business models exposed through the portal:

| Model          | Purpose                      |
| -------------- | ---------------------------- |
| `crm.lead`     | reseller-owned opportunities |
| `sale.order`   | quotations and sales orders  |
| `account.move` | invoices                     |
| `res.partner`  | reseller-linked customers    |

The field should be indexed where high-cardinality filtering is expected.

## Frontend implementation direction

The first portal UI should stay intentionally simple:

- one root Owl component
- dashboard state in one place
- tabbed sections for opportunities, quotations, sales orders, invoices, and customers
- loading, error, and empty states
- basic create/delete opportunity flows

A single initial dashboard fetch is acceptable for the first version if payload size stays reasonable.

See `docs/design.md` for the frontend look-and-feel contract that coding agents should follow.

## REST foundation direction

The generic REST layer is intentionally isolated in `base_rest_api`.

- generic request parsing, validation hooks, response envelopes, and generic exception handling belong in `base_rest_api`
- domain-specific schemas, serializers, and business error codes belong in the business addon
- this keeps the portal addon thinner and makes the REST foundation reusable in future addons

## Controller transport decision

The portal page and the API layer intentionally use different route styles:

- `/my/reseller-portal` remains a classic Odoo portal page route rendered with `type='http'`
- authenticated API endpoints also use `type='http'`, but return JSON through `request.make_json_response()`

This project intentionally does **not** use Odoo `type='jsonrpc'` for the portal API contract.

Reasoning:

- CRUD endpoints benefit from standard HTTP verbs such as `GET`, `POST`, and `DELETE`
- transport-level HTTP status codes remain meaningful
- the project keeps a custom response envelope instead of JSON-RPC `result` / `error` wrappers

The resulting API shape is therefore closer to a small internal REST-style application embedded inside Odoo portal infrastructure.

## Security conventions

The backend is the trust boundary.

- The frontend may suggest actions, but it must not define reseller scope.
- Ownership and reseller scope must be derived from the authenticated user session.
- Any privileged ORM access must still preserve reseller filtering before read, write, or unlink.
- Validation and exception layers may improve ergonomics, but they must never replace ownership checks or ORM-level security controls.

Phase-1 implementation direction:

- access is gated by a dedicated reseller portal group
- API reads and writes use restrictive reseller domains even on `sudo()` paths
- record rules can be added later if broader ORM-native access is required beyond these portal controllers

See `docs/security.md` for the strict rules.

## Documentation map

- `docs/conventions.md` — project architecture, scope, and implementation rules
- `docs/design.md` — frontend visual system and agent-facing UI constraints
- `docs/api.md` — endpoint contracts and payload shape
- `docs/security.md` — trust boundary, threat model, forbidden patterns
- `docs/ai-usage.md` — how AI is being used in this repo

## Assumptions to confirm

These are reasonable defaults, but they should be confirmed before the full implementation is locked in:

1. keep the technical business addon name as `partner_reseller_portal`
2. keep the reusable REST foundation in a standalone addon named `base_rest_api`
3. use standard portal authentication plus one dedicated reseller group for phase 1 access control
4. keep the first dashboard implementation either single-fetch or low-complexity lazy tabs, whichever stays simpler after scaffolding
