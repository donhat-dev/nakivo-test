---
description: "Use when creating or editing files inside the standalone `nakivo_base_rest/` addon. Covers generic REST conventions, error handling, validation, and reuse boundaries."
applyTo: "nakivo_base_rest/**/*"
---

- Keep `nakivo_base_rest` generic and reusable across addons.
- Do not put reseller-specific, CRM-specific, or portal-specific logic in this addon.
- Prefer Pydantic-first request schemas and typed helpers over framework magic.
- Keep error codes HTTP-oriented and module-agnostic in this addon.
- Domain-specific error codes and exceptions should live in business addons such as `nakivo_reseller_portal`.
- If OpenAPI support is added later, prefer explicit opt-in registration over scanning every Odoo route automatically.
- This addon must never depend on `nakivo_reseller_portal`.
