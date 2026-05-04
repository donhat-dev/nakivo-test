---
description: "Use when creating or editing files inside the future `partner_reseller_portal/` addon. Covers Odoo 19 portal security, addon layout, Owl asset placement, and test expectations."
applyTo: "partner_reseller_portal/**/*"
---

- Keep reseller-specific business behavior in `partner_reseller_portal/`; shared generic REST primitives belong in `base_rest_api/`.
- Backend trust boundary:
  - resolve the acting reseller/user from the authenticated session
  - never trust reseller or ownership fields coming from frontend payloads
  - when `sudo()` is necessary, apply restrictive ownership domains before read, write, or unlink
- Prefer ORM domains, record rules, and helper methods over raw SQL or controller-heavy business logic.
- Use `ValidationError` or `UserError` for business rule failures; avoid silent fallbacks.
- Portal pages and authenticated JSON endpoints should stay consistent with `docs/api.md` and `docs/security.md`.
- Frontend UI structure and styling should stay consistent with `docs/design.md`.
- Owl components should use XML templates, static translation strings, and assets registered through `__manifest__.py`.
- Portal-facing frontend assets normally belong in `web.assets_frontend`.
- Add tests for security-sensitive behavior:
  - `TransactionCase` for model and domain logic
  - `HttpCase` or tours only when an end-to-end portal flow needs verification
- If implementation changes API contracts, security guarantees, or architecture boundaries, update the matching file under `docs/` in the same change.
