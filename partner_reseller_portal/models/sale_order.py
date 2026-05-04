from __future__ import annotations

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class SaleOrder(models.Model):
    _inherit = "sale.order"

    reseller_partner_id = fields.Many2one(
        "res.partner",
        string="Reseller Partner",
        index=True,
        copy=False,
        ondelete="set null",
        domain="[('is_reseller', '=', True)]",
        help=(
            "Reseller partner responsible for this sales document in the "
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
        return [("reseller_partner_id", "=", reseller_partner.id)]

    def _reseller_portal_values(self):
        self.ensure_one()
        return {
            "id": self.id,
            "name": self.name,
            "partner_name": self.partner_id.display_name or "",
            "amount_total": self.amount_total,
            "currency_name": self.currency_id.name or "",
            "date_order": fields.Datetime.to_string(self.date_order)
            if self.date_order
            else False,
            "state": self.state,
        }
