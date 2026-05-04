# API Draft

## Scope

This file describes the intended controller contract for the reseller portal.
It is a design draft, not an implementation guarantee yet.

## API style guide

### Base path and versioning

Authenticated API routes should be built from typed constants rather than hardcoded strings.

Target pattern:

```text
/{API_PREFIX}/{API_VERSION}/{API_RESOURCE}
```

Default values for this project:

- `API_PREFIX = "api"`
- `API_VERSION = "v1"`
- `API_RESOURCE = "partner-portal"`

Effective base path:

```text
/api/v1/partner-portal
```

### Resource naming

- Use lowercase, hyphen-safe route segments.
- Prefer plural collection names for CRUD resources.
- Correct canonical resource names for this project include:
  - `partner-portal`
  - `opportunities`
  - `quotations`
  - `sales-orders`
  - `invoices`
  - `customers`

### Route style

This project uses a hybrid REST style.

- Standard CRUD should use nouns plus HTTP methods.
- `/<action>` suffixes are reserved for domain-specific operations that do not map cleanly to CRUD.

Examples:

- `GET /api/v1/partner-portal/opportunities`
- `POST /api/v1/partner-portal/opportunities`
- `DELETE /api/v1/partner-portal/opportunities/42`
- reserved future pattern: `POST /api/v1/partner-portal/opportunities/42/archive`

### Transport choice inside Odoo

For this portal API, authenticated endpoints should be implemented as Odoo `type='http'` routes returning JSON responses.

Why:

- custom HTTP verbs are clearer for CRUD routes
- HTTP status codes remain meaningful at the transport layer
- the project can keep its own response envelope

Odoo `type='jsonrpc'` is intentionally avoided for these endpoints because it wraps responses in JSON-RPC `result` / `error` objects and weakens the clarity of the agreed contract.

## Response envelope

### Success payload

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error payload

```json
{
  "success": false,
  "error": {
    "code": 404,
    "name": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### Envelope rules

- `success` is always present.
- Success responses return `data` and may return `meta`.
- Error responses return `error` and must not also return `data`.
- Error `code` is the numeric machine-readable code.
- Error `name` is the stable semantic identifier exposed to clients.
- Error `message` may be localized with Odoo translation helpers.
- Optional future fields may be added later inside `error`, such as `details`, `field_errors`, or `trace_id`, without breaking the phase-1 contract.

## Error codes and exception strategy

- Generic error codes and generic API exceptions should live in the standalone `nakivo_base_rest` addon.
- Domain-specific error codes should live in the business addon that owns the resource.
- Odoo business exceptions and request-validation failures should be mapped into the standard API envelope.
- Unexpected server failures must be sanitized before they reach the client.

Recommended split:

- `nakivo_base_rest` owns generic codes such as `BAD_REQUEST`, `INVALID_REQUEST_PAYLOAD`, `AUTHENTICATION_REQUIRED`, `ACCESS_DENIED`, `RESOURCE_NOT_FOUND`, `RESOURCE_CONFLICT`, `INTERNAL_SERVER_ERROR`
- `nakivo_reseller_portal` owns domain codes such as `OPPORTUNITY_NOT_FOUND`

## Typing and validation

- Use Python type hints throughout the backend.
- Use `typing.Final` for API path constants.
- Use Pydantic for request-boundary validation in phase 1.
- Request models should reject unknown fields with `extra='forbid'` unless a route explicitly needs looser input handling.
- Full response-schema duplication is not required in phase 1.

## Authentication model

All routes described here are intended to run behind authenticated Odoo sessions.
The acting reseller scope is derived from the logged-in user, not from the client payload.

## Page route

| Route                 | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| `/my/reseller-portal` | Render the reseller portal shell and mount the Owl frontend |

## Authenticated data/action endpoints

| Route                                       | Method   | Purpose                                                          |
| ------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `/api/v1/partner-portal/dashboard`          | `GET`    | Return reseller-scoped data for the main portal screen           |
| `/api/v1/partner-portal/opportunities`      | `GET`    | Return reseller-scoped opportunities                             |
| `/api/v1/partner-portal/opportunities`      | `POST`   | Create a new reseller-owned opportunity                          |
| `/api/v1/partner-portal/opportunities/<id>` | `DELETE` | Delete one reseller-owned opportunity after ownership validation |

## Dashboard response shape

The exact payload can evolve, but the success envelope for the dashboard is expected to look like this:

```json
{
  "success": true,
  "data": {
    "opportunities": [],
    "quotations": [],
    "sales_orders": [],
    "invoices": [],
    "customers": []
  },
  "meta": {
    "limit": 25,
    "counts": {
      "opportunities": 0,
      "quotations": 0,
      "sales_orders": 0,
      "invoices": 0,
      "customers": 0
    }
  }
}
```

### Record-shape guidance

Keep payloads intentionally small and portal-oriented.
Prefer user-facing fields and stable keys over raw ORM dumps.

Suggested fields by section:

| Section       | Suggested fields                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Opportunities | `id`, `name`, `partner_name`, `stage_name`, `expected_revenue`, `probability`, `date_deadline`          |
| Quotations    | `id`, `name`, `partner_name`, `amount_total`, `currency_name`, `date_order`, `state`                    |
| Sales orders  | `id`, `name`, `partner_name`, `amount_total`, `currency_name`, `date_order`, `state`                    |
| Invoices      | `id`, `name`, `partner_name`, `amount_total`, `currency_name`, `invoice_date`, `payment_state`, `state` |
| Customers     | `id`, `name`, `email`, `phone`, `city`, `country_name`                                                  |

## Create opportunity request

Suggested request body:

```json
{
  "name": "Opportunity title",
  "partner_id": 42,
  "expected_revenue": 10000,
  "description": "Optional notes"
}
```

### Create rules

- The client must not send `reseller_id` or `reseller_partner_id` as trusted scope inputs.
- The backend assigns reseller ownership from the authenticated session.
- The backend validates only the minimal fields needed for a usable opportunity record.
- Request-boundary validation is a good fit for a Pydantic model.

Suggested success response:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Opportunity title",
    "partner_name": "Customer A",
    "stage_name": "New",
    "expected_revenue": 10000,
    "probability": 0,
    "date_deadline": null
  },
  "meta": {}
}
```

Suggested validation failure response:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "name": "INVALID_REQUEST_PAYLOAD",
    "message": "Invalid request payload"
  }
}
```

## Delete opportunity request

Suggested behavior:

- the route parameter identifies the target record
- the backend verifies the record belongs to the current reseller scope before unlink
- failed ownership checks should not leak other resellers' data

Suggested success response:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "deleted": true
  },
  "meta": {}
}
```

Suggested forbidden / missing-record response:

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

## Error-handling guidance

- Use a centralized API exception layer instead of ad-hoc controller-specific payloads.
- Map Odoo business exceptions and Pydantic validation errors into stable application codes.
- Validation failures should surface as business errors, not silent no-ops.
- Ownership failures should behave like denied access or missing record from the caller's point of view.
- Avoid returning raw tracebacks or internal ORM details to the frontend.

## HTTP status guidance

Recommended status mapping:

| Case                                  | Status |
| ------------------------------------- | ------ |
| Successful read                       | `200`  |
| Successful create                     | `201`  |
| Successful delete with body           | `200`  |
| Invalid payload                       | `400`  |
| Forbidden ownership or access failure | `403`  |
| Missing resource in caller scope      | `404`  |
| Business conflict                     | `409`  |
| Unexpected internal failure           | `500`  |

## Generic vs specific API classes

Recommended layering:

- generic request schemas, response helpers, and exception mapping belong in `nakivo_base_rest`
- route-specific request schemas remain in the business addon
- resource-specific errors such as opportunity-not-found remain in the business addon

This keeps the REST foundation reusable without forcing resource knowledge into the base layer.

## CSRF and session behavior

- The portal page and API routes rely on the authenticated Odoo session.
- Unsafe HTTP methods in phase 1 should continue to use Odoo CSRF protection.
- Frontend calls should send `csrf_token` from the rendered portal page context.
- The implementation may use form-style POST submission and query-param CSRF on `DELETE` to stay compatible with `type='http'` routing.

## Pagination and limits

Initial implementation guidance:

- cap each dashboard collection to a small, documented limit such as 50 records
- add pagination only when data volume or UX proves it necessary
- avoid repeated refetches on every tab switch unless lazy loading is intentionally chosen
- if pagination is active, keep its high-level fields inside `meta`, such as `page`, `page_size`, `total`, and optionally `has_next`
