# frontend

React SPA for the Nakivo Reseller Portal. The source lives in `frontend/`, and the production build is embedded into Odoo at `/my/reseller-portal`.

## Stack

| Concern         | Tool                                             |
| --------------- | ------------------------------------------------ |
| Build           | Vite 8 + TypeScript 6                            |
| UI              | React 19                                         |
| Routing         | React Router v6                                  |
| Server state    | TanStack Query v5                                |
| Styling         | Tailwind CSS v3                                  |
| Animation       | GSAP 3 + @gsap/react                             |
| Icons           | Phosphor Icons v2                                |
| HTTP            | axios with `withCredentials: true`               |
| Forms           | react-hook-form + Zod                            |
| A11y primitives | Radix UI (Dialog, DropdownMenu, Select, Tooltip) |

Design system: `clean-signal-455` — Space Grotesk, zero border-radius, signal-blue primary, signal-green healthy state.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173 — proxies /api → localhost:8069
```

Odoo must be running for API calls to resolve. See `../docker/` for the full stack.

## Scripts

```bash
npm run dev        # Vite dev server with HMR
npm run build      # tsc -b && vite build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

## Environment variables

Create `.env.local` for local overrides (not committed):

```env
VITE_API_BASE=/api        # default — proxied to Odoo in dev, same-origin in production
VITE_APP_ENV=development
```

In production `vite build` writes a self-contained `index.html` into `../nakivo_reseller_portal/static/react/`.
No `VITE_` vars with hardcoded origins — always use relative `/api` paths.

## Directory layout

```
src/
├── api/
│   ├── client.ts          # axios instance + session-cookie transport
│   ├── auth.ts            # login, logout via Odoo session endpoints
│   └── portal.ts          # partner portal endpoints
├── components/
│   ├── ui/                # design system primitives (Button, Card, StatePanel, Table…)
│   └── layout/            # Sidebar, TopBar, PageShell, ProtectedRoute
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── OpportunitiesPage.tsx
│   ├── OrdersPage.tsx
│   ├── InvoicesPage.tsx
│   └── CustomersPage.tsx
├── hooks/
│   └── useAuth.ts
├── types/
│   └── api.ts             # TypeScript interfaces — must mirror Pydantic schemas exactly
├── App.tsx
├── main.tsx
└── index.css
```

## Auth flow

1. `POST /web/session/authenticate` through the frontend proxy authenticates against Odoo
2. Odoo sets the HttpOnly `session_id` cookie; the SPA stores `nakivo_session` only as a presence flag
3. Axios sends requests with `withCredentials: true`; no bearer token is attached
4. On `401`: the client clears local session markers and falls back to the SPA login state
5. `POST /web/session/destroy` logs the user out and invalidates the Odoo session server-side

## Production build

```bash
npm run build
# output is written to ../nakivo_reseller_portal/static/react/index.html
```

The root `Dockerfile` builds the SPA in a dedicated Node stage and copies the generated
file into the addon for image-based deployments. In local development, `npm run build`
updates the volume-mounted addon path directly.

## Demo credentials

Once the Odoo backend is running with demo data installed:

| Field    | Value               |
| -------- | ------------------- |
| Email    | `reseller@demo.com` |
| Password | `demo1234`          |
