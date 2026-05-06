# AGENTS.md — frontend

Scoped instructions for the `frontend/` React SPA. Read this before making any change to files under this directory.

Also read before touching API shapes or auth logic:

- `../docs/conventions.md` — session auth conventions, CORS conventions, frontend stack decisions
- `../docs/api.md` — endpoint contracts and response envelope
- `../docs/security.md` — trust boundary and forbidden patterns

---

## Stack — locked in, do not change

| Concern         | Package                    | Notes                                                    |
| --------------- | -------------------------- | -------------------------------------------------------- |
| Build           | `vite` + `typescript`      | Target ES2022, strict mode                               |
| UI              | `react` + `react-dom`      | v19                                                      |
| Routing         | `react-router-dom` v6      | `<ProtectedRoute>` wraps all auth pages                  |
| Server state    | `@tanstack/react-query` v5 | Cache keys mirror API resource paths                     |
| Styling         | `tailwindcss` v3           | Design tokens in `tailwind.config.ts`                    |
| Animation       | `gsap` + `@gsap/react`     | Scroll-triggered reveals only; not on data screens       |
| Icons           | `@phosphor-icons/react`    | Weight `light` for display, `bold` for inline indicators |
| HTTP            | `axios`                    | `withCredentials: true`; session cookie auth             |
| Forms           | `react-hook-form` + `zod`  | Zod schemas must mirror Pydantic request schemas         |
| A11y primitives | `@radix-ui/*`              | Dialog, DropdownMenu, Select, Tooltip only               |

Do not add: Material UI, Chakra, Ant Design, shadcn/ui, or any other component library.
Do not add: Redux, Zustand, Jotai, or any global state manager — TanStack Query covers server state; `useState`/Context covers the rest.

---

## Design system — non-negotiable constraints

Derived from `design/clean-signal-455/`. These constraints must not be overridden.

### Color tokens (`tailwind.config.ts`)

```
signal-ink    #101827   base text, dark backgrounds
signal-blue   #004CFF   primary action, interactive elements
signal-green  #21B799   live state, healthy indicator, confirmed action
signal-paper  #FFFFFF   page background
signal-wash   #F5F7FA   subtle surface, skeleton backgrounds
signal-line   #E4E8EF   borders, dividers
signal-muted  #687385   secondary text, labels
```

Never use arbitrary color values that are not in this token set.
Blue = primary action path. Green = live/healthy/confirmed. Never swap them.

### Geometry

- `border-radius: 0` everywhere — no `rounded-*` Tailwind classes, no exceptions
- No box shadows except those defined in the `bezel` CSS class

### Typography

- Font: Space Grotesk (`font-display` / `font-body` in Tailwind config)
- Display sizes use `clamp()` via Tailwind's `text-[clamp(...)]` syntax for fluid scaling
- Tracking: display headings use `tracking-[-0.06em]` to `tracking-[-0.07em]`

### Card / panel pattern

Always use the `bezel` + `bezel-core` CSS classes for card containers. Never create ad-hoc card styles.

```tsx
<div className="bezel">
  <div className="bezel-core p-6">{/* content */}</div>
</div>
```

### GSAP animation

Use GSAP only for entrance reveals and scroll-triggered effects on marketing/shell sections.
Never use GSAP inside data-driven components (tables, lists, form pages). CSS transitions only there.

---

## Component strategy

### Build from design (no library)

Build these from scratch using design tokens — they are simple and already have patterns in the design:

- `Button` (primary/secondary — based on `MagneticButton`)
- `Card` (thin wrapper for `bezel`/`bezel-core`)
- `Table`, `TableRow`
- `FormField`, `Input`, `Label`, `FieldError`
- `Badge`, `StatusDot`
- `StatePanel` (loading/error/empty/ready — based on `StatePreview`)

### Radix UI only for accessibility-hard primitives

These are the only cases where a Radix package is acceptable. Style them with design tokens.

| Component         | Radix package                   |
| ----------------- | ------------------------------- |
| Modal / Dialog    | `@radix-ui/react-dialog`        |
| Dropdown menu     | `@radix-ui/react-dropdown-menu` |
| Select / Combobox | `@radix-ui/react-select`        |
| Tooltip           | `@radix-ui/react-tooltip`       |

Do not install any other `@radix-ui/*` package without checking here first.

---

## Required UI states

Every data-driven page and panel **must** implement all three states. Omitting any is a bug.

```tsx
if (isLoading) return <StatePanel state="loading" />;
if (isError) return <StatePanel state="error" onRetry={refetch} />;
if (!data?.length) return <StatePanel state="empty" message="..." />;
// render data
```

---

## Auth — session conventions

See `../docs/conventions.md#session-authentication-conventions` for full spec. Summary:

- Auth mechanism: Odoo HTTP session cookie, sent automatically via `withCredentials: true`.
- Session presence: `localStorage` key `nakivo_session` stores the `session_id` string as a
  client-side presence flag. The actual auth trust root is the session cookie, not this value.
- `src/api/client.ts` uses `withCredentials: true` — no Bearer header, no token attachment.
- `src/api/auth.ts` calls `/web/session/authenticate` (Odoo JSON-RPC) on login and
  `/web/session/destroy` on logout. Uses bare `axios` (not the authenticated client).
- `ProtectedRoute` checks `localStorage.getItem('nakivo_session')` — redirect to `/login` if absent.
- Do not read/write `nakivo_session` anywhere except `src/api/auth.ts` and `src/api/client.ts`.

### On 401 response

```
401 received
  → remove nakivo_session from localStorage
  → redirect window.location.href = '/login'
  (no refresh attempt — session expiry requires re-login)
```

### Login flow

```
user submits credentials
  → POST /web/session/authenticate (Odoo JSON-RPC)
  → Odoo sets session_id cookie + returns { uid, session_id, name }
  → store session_id in localStorage.nakivo_session
  → navigate('/')
```

### Logout flow

```
user clicks Sign out
  → POST /web/session/destroy (Odoo JSON-RPC) — invalidates server-side session
  → remove nakivo_session from localStorage
  → navigate('/login')
```

---

## API conventions

- All requests go through the axios instance in `src/api/client.ts` — never use `fetch` directly.
- API base path: `/api/v1/` (relative, proxied by Vite in dev, nginx in prod).
- Every response follows the envelope:
  ```json
  { "success": true, "data": {}, "meta": {} }
  { "success": false, "error": { "code": 404, "name": "OPPORTUNITY_NOT_FOUND", "message": "..." } }
  ```
- Extract `data` from successful responses in the query function, not in the component.
- TanStack Query cache keys mirror API resource paths:
  ```ts
  ["opportunities"][("opportunities", id)][("opportunities", { status, page })]; // list // detail // filtered list
  ```

---

## TypeScript

- `src/types/api.ts` contains all request/response interfaces.
- These interfaces **must** mirror the Pydantic schemas in `../nakivo_reseller_portal/schemas/` exactly.
- When a Pydantic schema changes, update the matching interface in the same commit.
- Use `strict: true`. No `any`. No `@ts-ignore` without a comment explaining why.
- Infer component prop types from data types — don't duplicate interface fields in prop types.

---

## Routing

```
/login              LoginPage (public)
/                   DashboardPage (protected)
/opportunities      OpportunitiesPage (protected)
/opportunities/:id  OpportunityDetailPage (protected)
/orders             OrdersPage (protected)
/invoices           InvoicesPage (protected)
/customers          CustomersPage (protected)
```

All protected routes are wrapped in `<ProtectedRoute>` which redirects to `/login` if no valid token.
Do not check token validity inside individual pages — `<ProtectedRoute>` owns that concern.

---

## Responsive design

- Minimum functional viewport: 768px.
- Use Tailwind responsive prefixes: `md:`, `lg:`.
- The `md:grid-cols-*` pattern from the design is the primary layout mechanism.
- Light mode only — do not add `dark:` variants.

---

## Naming conventions

- Files: `kebab-case.tsx` for components, `camelCase.ts` for non-component modules.
- Components: `PascalCase`, named after business concepts (`OpportunityCard`, `ResellerSidebar`).
- Query hooks: `useOpportunities`, `useOrderDetail` — one hook per resource.
- API modules: `src/api/auth.ts`, `src/api/opportunities.ts`, `src/api/orders.ts` — one file per resource.

---

## What not to do

- Do not add `rounded-*` Tailwind classes — zero-radius is a hard constraint.
- Do not add `dark:` variants — light mode only.
- Do not use `fetch` directly — use the axios client.
- Do not read/write `nakivo_session` outside of `src/api/client.ts` and `src/api/auth.ts`.
- Do not pass `reseller_id` or ownership values in request bodies — the backend derives scope from the session.
- Do not add any global state manager (Redux, Zustand, etc.).
- Do not install a full component library.
- Do not use GSAP inside data-driven page components.
