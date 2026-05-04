from __future__ import annotations

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class AccountMove(models.Model):
    _inherit = "account.move"

    reseller_partner_id = fields.Many2one(
        "res.partner",
        string="Reseller Partner",
        compute="_compute_reseller_partner_id",
        store=True,
        readonly=False,
        index=True,
        copy=False,
        ondelete="set null",
        domain="[('is_reseller', '=', True)]",
        help="Reseller partner responsible for this invoice in the reseller portal.",
    )

    @api.depends("partner_id", "partner_id.reseller_partner_id")
    def _compute_reseller_partner_id(self):
        for record in self:
            record.reseller_partner_id = record.partner_id.reseller_partner_id

    @api.constrains("reseller_partner_id")
    def _check_reseller_partner_is_reseller(self):
        for record in self:
            reseller = record.reseller_partner_id
            if reseller and not reseller.is_reseller:
                raise ValidationError(
                    _("Partner '%s' is not flagged as a reseller.")
                    % reseller.display_name
                )

    @api.model
    def _reseller_portal_domain(self, reseller_partner):
        return [
            ("move_type", "=", "out_invoice"),
            ("reseller_partner_id", "=", reseller_partner.id),
        ]

    def _reseller_portal_values(self):
        self.ensure_one()
        return {
            "id": self.id,
            "name": self.name or self.display_name,
            "partner_name": self.partner_id.display_name or "",
            "amount_total": self.amount_total,
            "currency_name": self.currency_id.name or "",
            "invoice_date": fields.Date.to_string(self.invoice_date)
            if self.invoice_date
            else False,
            "payment_state": self.payment_state,
            "state": self.state,
        }
