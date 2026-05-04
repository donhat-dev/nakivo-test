from __future__ import annotations

import logging
from collections.abc import Callable, Mapping
from typing import Any

from pydantic import BaseModel
from pydantic import ValidationError as PydanticValidationError

from odoo import _
from odoo.exceptions import AccessError, MissingError, UserError, ValidationError
from odoo.http import request

from .error_codes import ErrorCodeLike, get_error_code_name, get_error_code_value
from .exceptions import (
    AuthenticationRequiredException,
    BaseApiException,
    InternalServerException,
    NotFoundException,
    PermissionDeniedException,
    ValidationException,
)

_logger = logging.getLogger(__name__)


class BaseRestHandler:
    def _dispatch_api(self, callback: Callable[[], Any]):
        try:
            return callback()
        except Exception as exc:  # pragma: no cover
            return self._handle_api_exception(exc)

    def _make_success_response(
        self,
        data: Any,
        *,
        meta: dict[str, Any] | None = None,
        status: int = 200,
    ):
        return request.make_json_response(
            {
                "success": True,
                "data": data,
                "meta": meta or {},
            },
            status=status,
        )

    def _make_error_response(
        self,
        error_code: ErrorCodeLike,
        message: str,
        *,
        status: int,
        details: dict[str, Any] | None = None,
    ):
        payload: dict[str, Any] = {
            "success": False,
            "error": {
                "code": get_error_code_value(error_code),
                "name": get_error_code_name(error_code),
                "message": message,
            },
        }
        if details:
            payload["error"]["details"] = details
        return request.make_json_response(payload, status=status)

    def _handle_api_exception(self, exc: Exception):
        if isinstance(exc, BaseApiException):
            return self._make_error_response(
                exc.error_code,
                str(exc.message),
                status=exc.http_status,
                details=exc.details,
            )

        if isinstance(exc, PydanticValidationError):
            validation_exc = ValidationException(
                _("Invalid request payload."),
                details={"field_errors": exc.errors()},
            )
            return self._make_error_response(
                validation_exc.error_code,
                str(validation_exc.message),
                status=validation_exc.http_status,
                details=validation_exc.details,
            )

        if isinstance(exc, UserError | ValidationError):
            validation_exc = ValidationException(str(exc))
            return self._make_error_response(
                validation_exc.error_code,
                str(validation_exc.message),
                status=validation_exc.http_status,
            )

        if isinstance(exc, AccessError):
            forbidden_exc = PermissionDeniedException(_("Access denied."))
            return self._make_error_response(
                forbidden_exc.error_code,
                str(forbidden_exc.message),
                status=forbidden_exc.http_status,
            )

        if isinstance(exc, MissingError):
            not_found_exc = NotFoundException(_("Resource not found."))
            return self._make_error_response(
                not_found_exc.error_code,
                str(not_found_exc.message),
                status=not_found_exc.http_status,
            )

        _logger.exception(
            "Unexpected nakivo_base_rest error",
            exc_info=exc,
        )
        internal_exc = InternalServerException(
            _("An unexpected server error occurred.")
        )
        return self._make_error_response(
            internal_exc.error_code,
            str(internal_exc.message),
            status=internal_exc.http_status,
        )

    def _ensure_authenticated(self):
        if not request.session.uid:
            raise AuthenticationRequiredException(_("Authentication required."))
        return request.env.user

    def _ensure_group(self, xml_id: str):
        user = self._ensure_authenticated()
        if not user.has_group(xml_id):
            raise PermissionDeniedException(_("Access denied."))
        return user

    def _parse_request_payload(self) -> dict[str, Any]:
        json_payload = self._parse_json_payload()
        if json_payload is not None:
            return json_payload

        payload = dict(request.get_http_params())
        payload.pop("csrf_token", None)
        return payload

    def _parse_json_payload(self) -> dict[str, Any] | None:
        content_type = (request.httprequest.content_type or "").lower()
        if "application/json" not in content_type:
            return None

        try:
            payload = request.httprequest.get_json(silent=False)
        except Exception as exc:
            raise ValidationException(_("Invalid JSON payload.")) from exc

        if payload is None:
            return {}
        if not isinstance(payload, Mapping):
            raise ValidationException(_("Request payload must be an object."))
        return dict(payload)

    def _validate_payload(self, schema: type[BaseModel]) -> BaseModel:
        return schema.model_validate(self._parse_request_payload())
