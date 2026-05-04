from __future__ import annotations

from http import HTTPStatus
from typing import Any

from .error_codes import ErrorCode, ErrorCodeLike, ValidationErrorCode


class BaseApiException(Exception):
    default_message = "Unexpected API error."
    default_error_code: ErrorCodeLike = ErrorCode.INTERNAL_SERVER_ERROR
    default_http_status = HTTPStatus.INTERNAL_SERVER_ERROR

    def __init__(
        self,
        message: str | None = None,
        *,
        error_code: ErrorCodeLike | None = None,
        http_status: int | HTTPStatus | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message or self.default_message
        self.error_code = error_code or self.default_error_code
        self.http_status = int(http_status or self.default_http_status)
        self.details = details or {}
        super().__init__(self.message)


class BadRequestException(BaseApiException):
    default_message = "Bad request."
    default_error_code = ErrorCode.BAD_REQUEST
    default_http_status = HTTPStatus.BAD_REQUEST


class ValidationException(BaseApiException):
    default_message = "Invalid request payload."
    default_error_code = ValidationErrorCode.INVALID_REQUEST_PAYLOAD
    default_http_status = HTTPStatus.BAD_REQUEST


class AuthenticationRequiredException(BaseApiException):
    default_message = "Authentication required."
    default_error_code = ErrorCode.AUTHENTICATION_REQUIRED
    default_http_status = HTTPStatus.UNAUTHORIZED


class PermissionDeniedException(BaseApiException):
    default_message = "Access denied."
    default_error_code = ErrorCode.ACCESS_DENIED
    default_http_status = HTTPStatus.FORBIDDEN


class NotFoundException(BaseApiException):
    default_message = "Resource not found."
    default_error_code = ErrorCode.RESOURCE_NOT_FOUND
    default_http_status = HTTPStatus.NOT_FOUND


class ConflictException(BaseApiException):
    default_message = "Resource conflict."
    default_error_code = ErrorCode.RESOURCE_CONFLICT
    default_http_status = HTTPStatus.CONFLICT


class InternalServerException(BaseApiException):
    default_message = "An unexpected server error occurred."
    default_error_code = ErrorCode.INTERNAL_SERVER_ERROR
    default_http_status = HTTPStatus.INTERNAL_SERVER_ERROR
