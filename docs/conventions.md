# Project Conventions

## Purpose

This file captures project-level architecture, scope, and implementation conventions.
Shared generic REST primitives live in the standalone `nakivo_base_rest` addon.

## Product goal

Build an authenticated reseller portal on Odoo 19 Community Edition with an Odoo-native stack:

- portal page rendered by Odoo
- Owl frontend mounted inside the portal page
- authenticated controller endpoints for portal data and actions
- backend-enforced reseller data isolation

## Current implementation direction

The repository is currently oriented around two addons:

- `nakivo_base_rest` for shared generic REST primitives
- `nakivo_reseller_portal` for reseller-specific business logic and portal UI

### Chosen stack

- **Shared API foundation:** standalone `nakivo_base_rest` addon with Pydantic-first generic REST primitives
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
/my  (Odoo portal home — shows reseller dashboard shortcut tile)
    ↓
/my/reseller-portal  (Odoo portal page shell — renders Owl SPA)
    ↓
Owl app mounts in the portal content area
    ↓
Frontend loads reseller-scoped dashboard data from /api/v1/partner-portal/dashboard
    ↓
Frontend calls authenticated HTTP JSON endpoints for read/create/delete actions
    ↓
Backend resolves current reseller from session and enforces ownership
```

## Expected addon structure

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

## Data model

`reseller_partner_id` is added to every business model the portal exposes:

| Model          | Purpose                      |
| -------------- | ---------------------------- |
| `crm.lead`     | reseller-owned opportunities |
| `sale.order`   | quotations and sales orders  |
| `account.move` | invoices                     |
| `res.partner`  | reseller-linked customers    |

`res.partner` also carries `is_reseller: Boolean` to distinguish reseller contacts from regular customers. All `reseller_partner_id` fields are constrained to `is_reseller = True` partners at the ORM level.
For business models with a customer `partner_id`, `reseller_partner_id` is a stored computed field derived from `partner_id.reseller_partner_id` and remains editable (`readonly=False`) for back-office correction flows.

## Portal home integration

Odoo convention: any addon contributing to the portal home page (`/my`) must override
`_prepare_home_portal_values` **and** provide a template that inherits `portal.portal_my_home`.

**Current gap**: `_prepare_home_portal_values` is not overridden, so portal users who are
resellers see a generic `/my/home` with no reseller dashboard shortcut.

Required implementation:

```python
# in the controller
def _prepare_home_portal_values(self, counters):
    values = super()._prepare_home_portal_values(counters)
    if 'reseller_portal_count' in counters:
        partner = request.env.user.partner_id
        if request.env.user.has_group(RESELLER_PORTAL_GROUP_XML_ID):
            values['reseller_portal_count'] = (
                request.env['crm.lead'].sudo().search_count(
                    request.env['crm.lead']._reseller_portal_domain(partner)
                )
            )
    return values
```

```xml
<!-- in views/nakivo_reseller_portal_templates.xml -->
<template id="portal_my_home_reseller"
          name="Reseller Portal"
          inherit_id="portal.portal_my_home"
          customize_show="True"
          priority="30">
    <xpath expr="//div[hasclass('o_portal_docs')]" position="before">
        <t t-set="portal_client_category_enable" t-value="True"/>
    </xpath>
    <div id="portal_client_category" position="inside">
        <t t-call="portal.portal_docs_entry">
            <t t-set="title">Reseller Dashboard</t>
            <t t-set="url" t-value="'/my/reseller-portal'"/>
            <t t-set="text">View your opportunities, orders, invoices, and customers</t>
            <t t-set="placeholder_count" t-value="'reseller_portal_count'"/>
        </t>
    </div>
</template>
```

The `placeholder_count` key is picked up by the `/my/counters` JSONRPC endpoint and drives
the badge display without blocking the initial page render.

## Portal page depth — SPA vs Odoo-native list pages

The current Owl SPA at `/my/reseller-portal` shows a 25-record dashboard per section. The
reseller's domain (`reseller_partner_id = user.partner_id`) is fundamentally different from
the standard portal customer domain (`partner_id child_of commercial_partner_id`), which means
the standard `/my/orders` and `/my/invoices` routes **cannot** be reused — overriding their
domain hooks would break the standard portal for non-reseller users.

**Evaluated options for full paginated browsing:**

| Option | Approach | Trade-off |
| --- | --- | --- |
| A — Extend SPA | Add per-section API pagination (`?page=N`) to existing JSON endpoints | Stays in current architecture; all browsing stays within the Owl app |
| B — Odoo-native pages | Add server-rendered pages at `/my/reseller-portal/quotations`, etc. following `_prepare_sale_portal_rendering_values` pattern | Odoo-idiomatic pager, breadcrumbs, and sorting out of the box |
| C — Hybrid | SPA for dashboard overview; deep links to dedicated server-rendered pages per section | Most flexible but highest maintenance |

**Phase 1 decision**: the SPA + 25-record limit is acceptable while total record counts stay
small. When pagination becomes necessary, **Option A** (extending the existing JSON endpoints
with `page`, `page_size`, `total`, `has_next` in the `meta` envelope) is the preferred path
because it avoids mixing rendering strategies inside the same `__manifest__.py` asset bundle.

Implement **Option B** only if the UX requirement is specifically for Odoo-native server-side
rendered list pages with deep-linking and URL-driven filters.

## Backend views — current gap

`is_reseller` and `reseller_partner_id` exist at the ORM level but have no backend view
extensions. Sales team and admins cannot see or set these fields through the BO UI.

Minimum view coverage needed:

| Model | View type | What to add |
| --- | --- | --- |
| `res.partner` | Form | `is_reseller` checkbox; `reseller_partner_id` (on customer forms) |
| `crm.lead` | Form | `reseller_partner_id` field in a dedicated group/page |
| `sale.order` | Form | `reseller_partner_id` field |
| `account.move` | Form | `reseller_partner_id` field (customer invoices only) |
| `res.partner` | List | Filter and optional column for `is_reseller` |

A dedicated **Resellers** menu item should list all partners where `is_reseller = True`. Placing
it under `Contacts / Resellers` (or inside the Sales configuration menu) is the natural location.

All backend view files go in `views/` with filenames following `<model>_views.xml`.

## Reseller management and identity model

### Identity model: res.partner + res.users

A reseller is a `res.partner` with `is_reseller = True`. To access the reseller portal, that
partner must also be linked to a `res.users` account that belongs to
`group_reseller_portal_user` (which implies `group_portal`).

This is the correct Odoo architecture:

- `res.partner` = the data/contact entity; `is_reseller` is a data-layer flag
- `res.users` = the access/authentication entity; group membership drives what they can do
- `user.partner_id` links the two

**Do not** move `is_reseller` to `res.users`. Partner-level flags belong on the partner, not
on the user record.

### Onboarding flow (current gap)

There is no dedicated onboarding flow. The required two-step manual process is:

1. Mark the partner as a reseller: `res.partner.is_reseller = True`
2. Grant portal access via the standard Odoo wizard (partner form → Action → Grant portal access)
3. Manually add the resulting portal user to `group_reseller_portal_user`

Step 3 is non-standard and easy to forget. Recommended future implementation: an action/button
on the partner form that performs steps 2 and 3 atomically when `is_reseller = True`.

### Group and ACL design

The current `group_reseller_portal_user` implies `base.group_portal`. This is correct. The
group acts as the additional access gate beyond standard portal authentication.

Record rules on all four models (`crm.lead`, `sale.order`, `account.move`, `res.partner`)
restrict reseller portal users to their own data. Controller-level domain checks are applied
on top of record rules as a belt-and-suspenders approach for write/unlink operations.

## Controller conventions

### Route decorator rules

- Use `readonly=True` on all GET-only routes (`type='http'`, `auth='user'`). This skips
  the savepoint overhead on read-only requests — the standard Odoo pattern from v17+.
- `website=True` is required for portal page routes that need the website context (breadcrumbs,
  portal layout). For pure JSON API routes it adds unnecessary overhead; evaluate dropping it
  when the API routes are fully decoupled from the website middleware.
- Do not combine GET and POST in one route decorator with method branching. Split into two
  separate route methods with distinct decorator declarations.

### Auth helpers

`_ensure_portal_page_access` and `_get_reseller_partner` are near-duplicates. Consider
collapsing to a single `_resolve_reseller_partner()` helper that raises the appropriate
exception type based on context (portal page vs API call).

### Dispatch pattern

All controller action methods must be wrapped in `self._dispatch_api(lambda: ...)` for
automatic exception mapping. Do not call `_make_success_response` or `_make_error_response`
directly from route methods.

## Frontend implementation direction

The first portal UI stays intentionally simple:

- one root Owl component
- dashboard state in one place
- tabbed sections for opportunities, quotations, sales orders, invoices, and customers
- loading, error, and empty states
- basic create/delete opportunity flows

See `DESIGN.md` for the frontend look-and-feel contract.

## Frontend component philosophy

### Build order

1. **CSS token layer first** — translate `DESIGN.md` tokens into CSS custom properties and
   Bootstrap variable overrides before writing any component.
2. **Decompose the screen into business-semantic Owl components** — identify boundaries from
   the actual screen, not from an abstract atom inventory.
3. **Extract generic components only at the second occurrence** — a shared component earns
   its existence when the same rendering pattern with different data appears in two or more
   places.

### What belongs in an Owl component vs CSS

An Owl component is justified when it encapsulates **reactive behavior that HTML alone cannot
provide**: managed state, lifecycle hooks, event coordination, keyboard navigation, or
portal rendering.

| Pattern | Right tool |
| --- | --- |
| Button colors, radius, hover states | SCSS + Bootstrap variable overrides |
| Badge semantic colors (success / warning / danger) | `StatusBadge` Owl component |
| Tab switching with count display | `DashboardTabBar` Owl component |
| Record card layout | `RecordCard` Owl component (when used in 2+ tabs) |
| Empty section placeholder | `EmptyState` Owl component |
| Loading indicator | `LoadingSpinner` Owl component |

### Naming

Name components after the business concept, not the generic UI pattern:
`RecordCard` not `Card`, `DashboardTabBar` not `Tabs`, `StatusBadge` not `Badge`.

## REST foundation direction

The generic REST layer is intentionally isolated in `nakivo_base_rest`.

- generic request parsing, validation hooks, response envelopes, and exception handling → `nakivo_base_rest`
- domain-specific schemas, serializers, and business error codes → `nakivo_reseller_portal`

## Controller transport decision

Authenticated API endpoints use `type='http'` returning JSON through
`request.make_json_response()`. `type='jsonrpc'` is intentionally avoided because it wraps
responses in JSON-RPC `result`/`error` objects and weakens the agreed HTTP-verb contract.

## Security conventions

The backend is the trust boundary. See `docs/security.md` for the full threat model.

- Reseller scope must come from the authenticated session, never from a client payload.
- Controller-level domain checks and ORM record rules work together:
  - record rules provide ORM-native isolation for all reseller portal users
  - controller domains remain on top of record rules for write/unlink operations

## Documentation map

- `docs/conventions.md` — project architecture, scope, and implementation rules
- `DESIGN.md` — frontend visual system and agent-facing UI constraints
- `docs/api.md` — endpoint contracts and payload shape
- `docs/security.md` — trust boundary, threat model, forbidden patterns
- `docs/ai-usage.md` — how AI is being used in this repo
