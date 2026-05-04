from __future__ import annotations

from odoo.addons.base_rest_api.exceptions import NotFoundException

from .error_codes import ErrorCode


class OpportunityNotFoundException(NotFoundException):
    default_message = "Opportunity not found."
    default_error_code = ErrorCode.OPPORTUNITY_NOT_FOUND
