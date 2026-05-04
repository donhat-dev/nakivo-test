Reusable REST primitives for Odoo addons.

Provides:

- request payload parsing and Pydantic-based validation
- a centralized exception hierarchy mapped to stable application error
  codes
- a single response envelope shared by every consumer addon
- helpers to enforce authentication and group membership inside
  `type='http'` controllers returning JSON responses
