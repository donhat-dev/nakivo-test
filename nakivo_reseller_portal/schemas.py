from __future__ import annotations

from pydantic import Field, field_validator

from odoo.addons.nakivo_base_rest.schemas import BaseRequestSchema


class CreateOpportunityPayload(BaseRequestSchema):
    name: str = Field(min_length=1, max_length=255)
    partner_id: int | None = None
    email: str | None = Field(default=None, max_length=254)
    phone: str | None = Field(default=None, max_length=50)
    expected_revenue: float | None = Field(default=None, ge=0)
    description: str | None = Field(default=None, max_length=5000)

    @field_validator("name")
    @classmethod
    def _validate_name(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Name is required.")
        return value

    @field_validator(
        "partner_id", "expected_revenue", "description", "email", "phone", mode="before"
    )
    @classmethod
    def _coerce_blank_to_none(cls, value: object) -> object:
        if value in (None, ""):
            return None
        return value
