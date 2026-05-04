---
description: "Use when creating or editing files inside the standalone `base_rest_api/` addon. Covers generic REST conventions, error handling, validation, and reuse boundaries."
applyTo: "base_rest_api/**/*"
---

- Keep `base_rest_api` generic and reusable across addons.
- Do not put reseller-specific, CRM-specific, or portal-specific logic in this addon.
- Prefer Pydantic-first request schemas and typed helpers over framework magic.
- Keep error codes HTTP-oriented and module-agnostic in this addon.
- Domain-specific error codes and exceptions should live in business addons such as `partner_reseller_portal`.
- If OpenAPI support is added later, prefer explicit opt-in registration over scanning every Odoo route automatically.
- This addon must never depend on `partner_reseller_portal`.
