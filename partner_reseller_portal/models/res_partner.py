from __future__ import annotations

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class ResPartner(models.Model):
    _inherit = "res.partner"

    is_reseller = fields.Boolean(
        string="Is Reseller",
        index=True,
        default=False,
        help="Mark this partner as a reseller eligible to own portal records.",
    )
    reseller_partner_id = fields.Many2one(
        "res.partner",
        string="Reseller Partner",
        index=True,
        copy=False,
        ondelete="set null",
        domain="[('is_reseller', '=', True)]",
        help="Reseller partner responsible for this customer in the reseller portal.",
    )

    @api.constrains("reseller_partner_id", "is_reseller")
    def _check_reseller_partner_id(self):
        for partner in self:
            reseller = partner.reseller_partner_id
            if not reseller:
                continue
            if reseller.id == partner.id:
                raise ValidationError(
                    _("A partner cannot be its own reseller.")
                )
            if not reseller.is_reseller:
                raise ValidationError(
                    _(
                        "The selected reseller partner '%s' is not flagged as a reseller."
                    )
                    % reseller.display_name
                )

    @api.model
    def _reseller_portal_domain(self, reseller_partner):
        return [
            ("reseller_partner_id", "=", reseller_partner.id),
            ("type", "!=", "private"),
        ]

    def _reseller_portal_values(self):
        self.ensure_one()
        return {
            "id": self.id,
            "name": self.display_name,
            "email": self.email or "",
            "phone": self.phone or self.mobile or "",
            "city": self.city or "",
            "country_name": self.country_id.name or "",
        }
