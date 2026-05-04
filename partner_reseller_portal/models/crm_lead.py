from __future__ import annotations

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class CrmLead(models.Model):
    _inherit = "crm.lead"

    reseller_partner_id = fields.Many2one(
        "res.partner",
        string="Reseller Partner",
        index=True,
        copy=False,
        ondelete="set null",
        domain="[('is_reseller', '=', True)]",
        help=(
            "Reseller partner responsible for this opportunity in the "
            "reseller portal."
        ),
    )

    @api.constrains("reseller_partner_id")
    def _check_reseller_partner_is_reseller(self):
        for record in self:
            reseller = record.reseller_partner_id
            if reseller and not reseller.is_reseller:
                raise ValidationError(
                    _(
                        "The selected reseller partner '%s' is not flagged as a reseller."
                    )
                    % reseller.display_name
                )

    @api.model
    def _reseller_portal_domain(self, reseller_partner):
        return [
            ("type", "=", "opportunity"),
            ("reseller_partner_id", "=", reseller_partner.id),
        ]

    @api.model
    def _prepare_reseller_portal_opportunity_vals(self, values, reseller_partner):
        sanitized_values = dict(values)
        sanitized_values.pop("reseller_id", None)
        sanitized_values.pop("reseller_partner_id", None)
        sanitized_values["type"] = "opportunity"
        sanitized_values["reseller_partner_id"] = reseller_partner.id
        return sanitized_values

    def _reseller_portal_values(self):
        self.ensure_one()
        return {
            "id": self.id,
            "name": self.name,
            "partner_name": self.partner_id.display_name or "",
            "stage_name": self.stage_id.display_name or "",
            "expected_revenue": self.expected_revenue,
            "probability": self.probability,
            "date_deadline": fields.Date.to_string(self.date_deadline)
            if self.date_deadline
            else False,
        }
