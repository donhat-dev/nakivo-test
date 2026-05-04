Inherit `BaseRestHandler` in your controller and call `_dispatch_api` to
wrap the request lifecycle. Use `_validate_payload` with a Pydantic
schema to validate incoming data, and `_make_success_response` /
`_make_error_response` to return the standard envelope.

The handler maps Odoo `UserError`, `ValidationError`, `AccessError`,
`MissingError`, and Pydantic `ValidationError` instances into stable API
exceptions automatically.
