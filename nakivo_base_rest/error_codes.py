from __future__ import annotations

from enum import Enum
from typing import TypeAlias

ErrorCodeLike: TypeAlias = int | Enum


class ErrorCode(Enum):
    BAD_REQUEST = 400
    AUTHENTICATION_REQUIRED = 401
    ACCESS_DENIED = 403
    RESOURCE_NOT_FOUND = 404
    RESOURCE_CONFLICT = 409
    INTERNAL_SERVER_ERROR = 500


class ValidationErrorCode(Enum):
    INVALID_REQUEST_PAYLOAD = 400


def get_error_code_value(error_code: ErrorCodeLike) -> int:
    if isinstance(error_code, Enum):
        return int(error_code.value)
    return int(error_code)


def get_error_code_name(error_code: ErrorCodeLike) -> str:
    if isinstance(error_code, Enum):
        return str(error_code.name)
    return str(error_code)
