# Nakivo Test — Partner Reseller Portal for Odoo 19

Authenticated reseller portal built on **Odoo 19 Community Edition** with an Odoo-native stack:

- Odoo portal page for authenticated access
- Owl frontend for the reseller dashboard UI
- REST-style HTTP JSON endpoints for portal reads and actions
- strict backend-enforced reseller data isolation

## Overview

This repository is currently organized around two related addons:

- `nakivo_base_rest/` — reusable Pydantic-first REST primitives for Odoo addons
- `nakivo_reseller_portal/` — reseller-specific portal UI, business logic, and API endpoints

The implementation follows a deliberately simple architecture:

```text
Portal user login
	↓
Open /my/reseller-portal
	↓
Odoo renders the page shell
	↓
Owl app mounts in the portal content area
	↓
Frontend calls authenticated JSON endpoints
	↓
Backend resolves reseller from the session and enforces ownership
```

## Repository structure

```text
nakivo-test/
├── .github/                     # instructions + CI workflows
├── docker/                      # local Odoo/Postgres compose config
├── Dockerfile                   # Odoo 19 image with runtime requirements
├── nakivo_base_rest/            # shared REST foundation addon
├── docs/                        # project conventions, API, security, design notes
├── nakivo_reseller_portal/      # reseller portal addon
├── .editorconfig
├── .pre-commit-config.yaml
├── .pylintrc
├── .pylintrc-mandatory
├── .ruff.toml
├── eslint.config.cjs
├── requirements.txt
└── requirements-dev.txt
```

## Addons

### `nakivo_base_rest`

Provides shared API primitives:

- request parsing helpers
- Pydantic-based request validation
- centralized exception mapping
- standardized success and error envelopes
- semantic error codes with numeric values

### `nakivo_reseller_portal`

Implements the reseller-facing flow:

- portal page at `/my/reseller-portal`
- reseller-scoped dashboard data
- reseller-scoped opportunity creation
- reseller-scoped opportunity deletion
- Owl frontend assets loaded in `web.assets_frontend`

## API contract highlights

The authenticated API uses `type='http'` routes returning JSON via `request.make_json_response()`.

Error responses follow this envelope:

```json
{
  "success": false,
  "error": {
    "code": 404,
    "name": "OPPORTUNITY_NOT_FOUND",
    "message": "Opportunity not found"
  }
}
```

See the full contract in `docs/api.md`.

## Security principles

The backend is the trust boundary.

- never trust reseller identifiers from frontend payloads
- always derive reseller scope from the authenticated session
- apply restrictive domains before any `sudo()` access
- sanitize unexpected backend failures before returning them to the client

See `docs/security.md` for the threat model and forbidden patterns.

## Documentation map

- `AGENTS.md` — root instructions for coding agents working in this repo
- `docs/conventions.md` — architecture and implementation rules
- `docs/design.md` — frontend visual contract for agent-generated UI
- `docs/api.md` — endpoint and payload design
- `docs/security.md` — security boundaries and data-isolation rules
- `docs/ai-usage.md` — AI usage notes for the assignment

## Requirements

### Runtime

- Python 3.10+
- Odoo 19 Community Edition
- `pydantic>=2.8,<3.0`

Install runtime dependency:

```bash
python3 -m pip install -r requirements.txt
```

For Docker-based local development, the compose stack builds the repository
`Dockerfile`, installs `requirements.txt`, and writes Odoo logs to
`docker/logs/odoo-server.log` with logrotate configured:

```bash
cd docker
docker compose up -d --build
```

### Development tooling

Install development tooling for local quality checks:

```bash
python3 -m pip install -r requirements-dev.txt
pre-commit install
```

## Quality checks

This repository now includes a lightweight quality toolchain inspired by `mvillage-test` and adapted for the current Odoo 19 addon layout:

- `ruff` for Python linting and formatting
- `pylint-odoo` for Odoo-specific static checks
- `prettier` for Markdown / YAML / XML / frontend assets
- `eslint` for JavaScript files
- GitHub Actions workflow running `pre-commit`

Run all local checks:

```bash
pre-commit run --all-files
```

Quick syntax validation for both addons:

```bash
python3 -m compileall nakivo_base_rest nakivo_reseller_portal
```

## Current status

The repository already contains:

- the generic `nakivo_base_rest` addon
- the first implementation of `nakivo_reseller_portal`
- architecture, API, security, and design documentation
- root-level lint and GitHub workflow scaffolding

The project is intentionally optimized for correctness and simplicity over framework sprawl. Fancy is optional; secure is not.
