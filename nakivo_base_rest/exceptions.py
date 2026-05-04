from __future__ import annotations

from http import HTTPStatus
from typing import Any

from .error_codes import ErrorCode, ErrorCodeLike, ValidationErrorCode


class BaseApiException(Exception):
    message = "Unexpected API error."
    code: ErrorCodeLike = ErrorCode.INTERNAL_SERVER_ERROR
    status_code = HTTPStatus.INTERNAL_SERVER_ERROR

    def __init__(
        self,
        message: str | None = None,
        *,
        error_code: ErrorCodeLike | None = None,
        http_status: int | HTTPStatus | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message or self.message
        self.error_code = error_code or self.code
        self.http_status = int(http_status or self.status_code)
        self.details = details or {}
        super().__init__(self.message)


class BadRequestException(BaseApiException):
    message = "Bad request."
    code = ErrorCode.BAD_REQUEST
    status_code = HTTPStatus.BAD_REQUEST


class ValidationException(BaseApiException):
    message = "Invalid request payload."
    code = ValidationErrorCode.INVALID_REQUEST_PAYLOAD
    status_code = HTTPStatus.BAD_REQUEST


class AuthenticationRequiredException(BaseApiException):
    message = "Authentication required."
    code = ErrorCode.AUTHENTICATION_REQUIRED
    status_code = HTTPStatus.UNAUTHORIZED


class PermissionDeniedException(BaseApiException):
    message = "Access denied."
    code = ErrorCode.ACCESS_DENIED
    status_code = HTTPStatus.FORBIDDEN


class NotFoundException(BaseApiException):
    message = "Resource not found."
    code = ErrorCode.RESOURCE_NOT_FOUND
    status_code = HTTPStatus.NOT_FOUND


class ConflictException(BaseApiException):
    message = "Resource conflict."
    code = ErrorCode.RESOURCE_CONFLICT
    status_code = HTTPStatus.CONFLICT


class InternalServerException(BaseApiException):
    message = "An unexpected server error occurred."
    code = ErrorCode.INTERNAL_SERVER_ERROR
    status_code = HTTPStatus.INTERNAL_SERVER_ERROR
