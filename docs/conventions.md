# Project Conventions

## Purpose

This file captures project-level architecture, scope, and implementation conventions.
Shared generic REST primitives live in the standalone `nakivo_base_rest` addon.

## Product goal

Build a Partner Portal for resellers with:

- a React SPA frontend (primary, reviewer-facing deliverable)
- Odoo 19 Community Edition backend with session-authenticated REST API
- backend-enforced reseller data isolation

## Current implementation direction

The repository is currently oriented around two addons:

- `nakivo_base_rest` for shared generic REST primitives
- `nakivo_reseller_portal` for reseller-specific business logic and portal UI

### Chosen stack

- **Shared API foundation:** standalone `nakivo_base_rest` addon with Pydantic-first generic REST primitives
- **Backend:** Odoo ORM, controllers, XML/QWeb
- **Primary frontend:** React 19 + Vite 8 + TypeScript 6 + TanStack Query + Tailwind CSS + shadcn/ui
- **Authentication:** Odoo session cookie (`/web/session/authenticate`); `withCredentials: true` on all API calls
- **Authorization gate:** dedicated reseller portal group; routes use `auth='user'`
- **Deployment model:** Odoo serves the built SPA at `/my/reseller-portal`; `frontend/` is the source workspace and build step
- **API transport:** authenticated Odoo `type='http'` routes returning JSON responses

### Explicit non-goals for the first iteration

- native mobile app
- generic REST utilities embedded directly inside the reseller addon
- SEO-oriented public website behavior
- feature-rich UI beyond basic portal usability
- broad cross-module abstractions before the main flow works

## Architectural outline

### React SPA (primary)

```text
Portal user login
    ↓
GET /my or /my/reseller-portal
    ↓
Odoo returns the built React SPA HTML from nakivo_reseller_portal/static/react/index.html
    ↓
GET/POST/DELETE /api/v1/partner-portal/*  with  Cookie: session_id=<value>
    ↓
Odoo session middleware validates cookie → binds request.env to reseller user (auth='user')
    ↓
Backend resolves reseller from request.env.user.partner_id, enforces ownership, returns JSON envelope
```

### Frontend source workspace

```text
frontend/ source
    ↓
vite build + vite-plugin-singlefile
    ↓
nakivo_reseller_portal/static/react/index.html
    ↓
Odoo route /my/reseller-portal serves the embedded SPA
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

The current React SPA shows a 25-record dashboard slice per section. The
reseller's domain (`reseller_partner_id = user.partner_id`) is fundamentally different from
the standard portal customer domain (`partner_id child_of commercial_partner_id`), which means
the standard `/my/orders` and `/my/invoices` routes **cannot** be reused — overriding their
domain hooks would break the standard portal for non-reseller users.

**Evaluated options for full paginated browsing:**

| Option                | Approach                                                                                                                      | Trade-off                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| A — Extend SPA        | Add per-section API pagination (`?page=N`) to existing JSON endpoints                                                         | Stays in current architecture; all browsing stays within the React app |
| B — Odoo-native pages | Add server-rendered pages at `/my/reseller-portal/quotations`, etc. following `_prepare_sale_portal_rendering_values` pattern | Odoo-idiomatic pager, breadcrumbs, and sorting out of the box          |
| C — Hybrid            | SPA for dashboard overview; deep links to dedicated server-rendered pages per section                                         | Most flexible but highest maintenance                                  |

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

| Model          | View type | What to add                                                       |
| -------------- | --------- | ----------------------------------------------------------------- |
| `res.partner`  | Form      | `is_reseller` checkbox; `reseller_partner_id` (on customer forms) |
| `crm.lead`     | Form      | `reseller_partner_id` field in a dedicated group/page             |
| `sale.order`   | Form      | `reseller_partner_id` field                                       |
| `account.move` | Form      | `reseller_partner_id` field (customer invoices only)              |
| `res.partner`  | List      | Filter and optional column for `is_reseller`                      |

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

### Session authentication

All JSON API routes use `auth='user'` in the `@route` decorator. Odoo's session
middleware validates the `session_id` cookie on every request and binds
`request.env` to the authenticated user before the controller method runs.

No custom auth mixin is required. Advantages over JWT:

- Sessions are stored server-side and can be invalidated immediately (multi-device revocation).
- No token signing infrastructure or secret key management.
- Native to Odoo — session expiry, activity tracking, and security auditing all work out of the box.

The reseller group check (`user.has_group(RESELLER_PORTAL_GROUP_XML_ID)`) should be
performed at the start of each controller action or via a shared helper, since
`auth='user'` only verifies that the user is logged in, not that they are a reseller.

```python
def _resolve_reseller_partner(self):
    user = request.env.user
    if not user.has_group(RESELLER_PORTAL_GROUP_XML_ID):
        raise AccessDenied()
    return user.partner_id
```

### Dispatch pattern

All controller action methods must be wrapped in `self._dispatch_api(lambda: ...)` for
automatic exception mapping. Do not call `_make_success_response` or `_make_error_response`
directly from route methods.

## Frontend implementation direction

The React SPA stays intentionally simple:

- one authenticated application shell
- page-level data ownership through TanStack Query and route boundaries
- sections for opportunities, quotations, sales orders, invoices, and customers
- loading, error, and empty states on every data screen
- basic create/delete opportunity flows

See `DESIGN.md` for the frontend look-and-feel contract.

## Frontend component philosophy

### Build order

1. **CSS token layer first** — translate `DESIGN.md` tokens into CSS custom properties and
   Tailwind/theme primitives before writing any component.
2. **Decompose the screen into business-semantic React components** — identify boundaries from
   the actual screen, not from an abstract atom inventory.
3. **Extract generic components only at the second occurrence** — a shared component earns
   its existence when the same rendering pattern with different data appears in two or more
   places.

### What belongs in a React component vs CSS

A React component is justified when it encapsulates **reactive behavior that HTML alone cannot
provide**: managed state, lifecycle hooks, event coordination, keyboard navigation, or
route-aware composition.

| Pattern                                            | Right tool                                     |
| -------------------------------------------------- | ---------------------------------------------- |
| Button colors, radius, hover states                | Tailwind utilities + tokenized CSS variables   |
| Badge semantic colors (success / warning / danger) | `StatusBadge` React component                  |
| Section navigation with count display              | Sidebar or tab React component                 |
| Record card or row layout                          | Shared React component when reused in 2+ pages |
| Empty section placeholder                          | `EmptyState` React component                   |
| Loading indicator                                  | `LoadingSpinner` React component               |

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
  After Odoo's session middleware binds `request.env`, the safe pattern is:
  ```python
  reseller = request.env.user.partner_id  # env is bound to the session user
  ```
  Never accept a `reseller_id` or `partner_id` from the request body for scoping.
- Controller-level domain checks and ORM record rules work together:
  - record rules provide ORM-native isolation for all reseller portal users
  - controller domains remain on top of record rules for write/unlink operations

## Session authentication conventions

### Login

The React SPA logs in via Odoo's native JSON-RPC endpoint:

`POST /web/session/authenticate`

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "db": "nakivo_crm",
    "login": "reseller@demo.com",
    "password": "demo1234"
  }
}
```

On success Odoo returns `{ "result": { "uid": 42, "session_id": "...", "name": "..." } }`
and sets an HttpOnly `session_id` cookie. The frontend stores `session_id` in
`localStorage` under key `nakivo_session` as a presence flag (not a trust token) so
`ProtectedRoute` can redirect immediately without a network call.

On bad credentials `result.uid` is `false` — treat as 401.

### Logout

`POST /web/session/destroy` (JSON-RPC, `params: {}`) — invalidates the server-side
session. The frontend then removes `nakivo_session` from localStorage.

### Cookie transport

The React SPA sets `axios.defaults.withCredentials = true` (via the `client` instance).
In dev the Vite server proxies both `/api` and `/web` to Odoo on port 8069. In production
the built SPA is served by Odoo itself at `/my/reseller-portal`, so requests stay same-origin
on port 8069 and the session cookie is sent automatically.

### Session revocation

Sessions are stored in Odoo's `ir.http_session` store (filesystem or Redis). Revoking
a session server-side — by calling `/web/session/destroy` or deleting the session file —
blocks all subsequent requests from that device immediately. This is the primary advantage
over stateless JWT for multi-device management.

Deactivating a user (`user.active = False`) also blocks access on the next request because
`auth='user'` validates the session user's active state on every call.

---

## CORS conventions

In development the Vite proxy (`/api`, `/web` → `http://localhost:8069`) makes all
requests same-origin from the browser's perspective — CORS headers are not needed and
the session cookie is sent automatically.

In production the SPA is served by Odoo at the same origin as the API routes, so no
cross-origin setup is needed for the default deployment model.

If a direct cross-origin deployment is ever required (SPA and API on truly different
domains), all API controllers must emit:

```
Access-Control-Allow-Origin: <explicit-origin>   (never * with credentials)
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

Use Odoo's built-in `cors=` route parameter for `OPTIONS` preflight. With session
cookies `csrf=False` is required on API routes — CSRF protection is handled by the
`SameSite` cookie attribute instead.

---

## Frontend stack conventions

### React SPA (primary)

| Concern      | Tool / Library                | Notes                                             |
| ------------ | ----------------------------- | ------------------------------------------------- |
| Build        | Vite 8 + TypeScript 6         | `npm run dev` proxies `/api` to `:8069`           |
| Routing      | React Router v6               | `<ProtectedRoute>` wraps all post-login pages     |
| Server state | TanStack Query v5             | Cache keys mirror API resource paths              |
| Client state | useState / Context            | No Redux — TanStack Query covers server state     |
| Styling      | Tailwind CSS v3               | Follow DESIGN.md token system                     |
| Components   | shadcn/ui (copy-paste)        | Not an npm dep; component files live in `src/ui/` |
| HTTP         | axios with interceptor        | `withCredentials: true`; 401 → redirect `/login`  |
| Forms        | react-hook-form + Zod         | Zod schemas mirror Pydantic request schemas       |
| Dev proxy    | vite.config.ts `server.proxy` | `/api` → `http://localhost:8069`                  |

### Session storage

- `localStorage` key `nakivo_session` stores the `session_id` string returned by
  `/web/session/authenticate`. This is a **presence flag only** — it allows
  `ProtectedRoute` to redirect without a network round-trip.
- The actual authentication trust root is the HttpOnly session cookie set by Odoo.
  Even if someone forges `nakivo_session` in localStorage, API requests will fail
  (401) without a valid session cookie.
- On 401: axios interceptor removes `nakivo_session` and redirects to `/login`.
  No refresh attempt — session expiry requires the user to re-authenticate.

### TypeScript ↔ Pydantic type alignment

TypeScript interfaces in `src/types/api.ts` must mirror Pydantic request/response
schemas exactly. When a Pydantic schema changes, the corresponding TS interface must
be updated in the same commit. Drift between Python and TypeScript shapes is a silent
runtime failure class.

Future: generate `src/types/api.ts` via openapi-typescript from an OpenAPI spec
derived from Pydantic schemas. For now: manual, co-located, enforced by code review.

### Required UI states

Every data-fetching screen must implement all three states:

- **Loading** — skeleton cards or spinner while the query is in-flight
- **Error** — error message with a retry button on query failure
- **Empty** — contextual message when the result set is zero records

Omitting any of these is a functional bug, not a cosmetic choice.

### Responsive design

All screens must be functional at 768 px viewport width minimum. Use Tailwind
breakpoint prefixes (`sm:`, `md:`, `lg:`) as defined in the DESIGN.md breakpoint
table. Do not target mobile-only (below 640 px) for the first iteration.

### Historical Owl code

Some Owl/QWeb portal code may still exist in the addon, but `/my/reseller-portal`
now serves the React SPA. New frontend work should target React unless a task
explicitly calls for legacy cleanup or decommissioning.

---

## Deployment model

The React SPA is embedded directly inside Odoo — no separate nginx/frontend service.

### How it works

`vite build` (with `vite-plugin-singlefile`) produces a single self-contained
`index.html` (all JS and CSS inlined). The output lands at:

```
nakivo_reseller_portal/static/react/index.html
```

The Odoo controller at `GET /my/reseller-portal` reads this file, injects the
current session as `window.__ODOO_SESSION__`, and returns it as a plain HTML
response. Odoo's `auth='user'` on the route handles the login redirect natively.

### Local dev workflow

```bash
cd frontend && npm install && npm run build
# Output: nakivo_reseller_portal/static/react/index.html

cd ../docker && docker compose up -d
# Access: http://localhost:8069/my/reseller-portal
```

After frontend changes, `npm run build` picks up via the existing volume mount —
no Docker rebuild needed.

### Production (image-based)

The `Dockerfile` `frontend-build` stage runs `npm ci && npm run build` and the
`production` stage `COPY`s the built file into the Odoo image. No volume mounts
needed in production — the SPA is baked into the image.

### Docker services

| Service | Port | Contents                        |
| ------- | ---- | ------------------------------- |
| `db`    | 5432 | PostgreSQL 16                   |
| `odoo`  | 8069 | Odoo 19 CE + addons + React SPA |

Single entry point: `http://localhost:8069` → login → `/my/reseller-portal`

---

## Seed data

A demo fixture is required so reviewers can evaluate the portal without manual
database setup.

| Record type   | Count | Credentials / notes                              |
| ------------- | ----- | ------------------------------------------------ |
| Reseller user | 1     | login: `reseller@demo.com`, password: `demo1234` |
| Opportunities | 5     | varied stages (New, Qualified, Won, Lost)        |
| Sale orders   | 3     | 2 quotations, 1 confirmed                        |
| Invoices      | 2     | 1 draft, 1 posted                                |
| Customers     | 4     | linked to the demo reseller partner              |

Fixture: `nakivo_reseller_portal/data/demo_reseller.xml` (category `demo`).
The README must display the demo login credentials prominently.

---

## Documentation map

- `docs/conventions.md` — project architecture, scope, and implementation rules
- `DESIGN.md` — frontend visual system and agent-facing UI constraints
- `docs/api.md` — endpoint contracts and payload shape
- `docs/security.md` — trust boundary, threat model, forbidden patterns
- `docs/ai-usage.md` — how AI is being used in this repo
