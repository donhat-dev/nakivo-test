from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class BaseRequestSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class PaginationQuerySchema(BaseRequestSchema):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=100)
