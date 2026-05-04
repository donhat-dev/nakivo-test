# Security

## Core rule

The backend owns reseller scope.

Any frontend payload is untrusted for access-control purposes.

## Required trust-boundary rules

- Never trust `reseller_id`, `reseller_partner_id`, or equivalent ownership values sent by the client.
- Always resolve the acting reseller from the authenticated request context.
- When privileged ORM access is used, keep reseller filtering in place before any read, write, or unlink.
- Do not rely on UI hiding alone to protect data.
- Validation success must never be treated as an authorization decision.

## Safe pattern

```python
reseller = request.env.user.partner_id
records = request.env[model_name].sudo().search([
    ("reseller_partner_id", "=", reseller.id),
])
```

## Forbidden patterns

```python
reseller_id = payload.get("reseller_id")
model.sudo().search([])
model.sudo().browse(record_id).unlink()
```

## Threat model

| Threat                 | Example                                                           | Expected control                                          |
| ---------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| Cross-reseller read    | user alters frontend request to load another reseller's records   | reseller scope derived from session + filtered ORM access |
| Cross-reseller delete  | user calls delete endpoint with another reseller's opportunity id | ownership check before unlink                             |
| Over-broad `sudo()`    | controller uses `sudo()` without scope filter                     | restrictive reseller domain applied before access         |
| Data leakage in errors | backend exposes internal record details                           | user-facing business errors only                          |
| UI-only protection     | hidden button assumed to be enough                                | backend validation remains authoritative                  |

## Access-control direction

The implementation can combine multiple layers:

1. portal authentication
2. ACLs and a dedicated reseller portal group
3. record rules on reseller-scoped models
4. controller-level ownership checks for sensitive actions such as delete

The ORM layer should remain the primary enforcement point whenever possible.

Phase-1 implementation note:

- the current implementation uses a dedicated reseller portal group plus controller-level reseller-domain checks on `sudo()` record access
- model access is intentionally funneled through the portal controllers for now
- record rules remain a valid next step if the portal later needs broader ORM-native access patterns

## Controller checklist

Before merging any portal controller change, verify:

- [ ] route is authenticated
- [ ] reseller scope comes from the session, not the payload
- [ ] any `sudo()` path is domain-restricted before access
- [ ] create flow auto-assigns reseller ownership
- [ ] delete flow verifies ownership before unlink
- [ ] response avoids leaking unrelated record metadata
- [ ] unexpected exceptions are sanitized before they reach the client
- [ ] stable API error codes are returned for known failure classes

## Record-rule direction

If record rules are used for reseller users, design them so that portal users only see records where:

- `reseller_partner_id == user.partner_id`

Be careful when mixing global rules and group rules; overlapping global rules can unintentionally remove all access.

## Output safety

- Avoid `t-raw` for content that can evolve from user or business data.
- Escape dynamic content in templates and generated markup.
- Avoid returning raw HTML from controller endpoints when structured JSON is enough.

## API exception and error-code guidance

- Generic API-facing exceptions should be centralized in `base_rest_api` instead of being handcrafted in each controller.
- Known failures should map to stable application codes exposed to clients.
- Business addons may define specific exceptions and error codes for resource-specific failures.
- Error messages may be localized for end users, but error codes must remain stable and language-independent.
- Raw tracebacks, ORM internals, and unrelated record metadata must remain server-side only.
- Unsafe `type='http'` API methods should keep CSRF protection enabled and consume `csrf_token` from the authenticated portal page.

Recommended API error mapping examples:

| Failure class                  | Example status | Example code              |
| ------------------------------ | -------------- | ------------------------- |
| Invalid request payload        | `400`          | `INVALID_REQUEST_PAYLOAD` |
| Authentication / session issue | `401`          | `AUTHENTICATION_REQUIRED` |
| Forbidden ownership access     | `403`          | `ACCESS_DENIED`           |
| Missing reseller-scoped record | `404`          | `OPPORTUNITY_NOT_FOUND`   |
| Unexpected internal error      | `500`          | `INTERNAL_SERVER_ERROR`   |

The client-facing envelope should stay small:

```json
{
  "success": false,
  "error": {
    "code": 403,
    "name": "ACCESS_DENIED",
    "message": "Access denied"
  }
}
```

Optional future fields such as `details`, `field_errors`, or `trace_id` may be added later if observability or UX needs grow.

## Test scenarios to keep

Minimum security tests should cover:

1. reseller A only sees A data
2. reseller B only sees B data
3. reseller A cannot delete B opportunity
4. create assigns reseller ownership automatically
5. APIs ignore any client-supplied reseller ownership field
