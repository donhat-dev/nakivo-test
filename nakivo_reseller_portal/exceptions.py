from __future__ import annotations

from odoo.addons.nakivo_base_rest.exceptions import NotFoundException

from .error_codes import ErrorCode


class OpportunityNotFoundException(NotFoundException):
    message = "Opportunity not found."
    code = ErrorCode.OPPORTUNITY_NOT_FOUND
