from __future__ import annotations

from odoo import Command, _, api, fields, models
from odoo.exceptions import UserError, ValidationError


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
    has_reseller_portal_access = fields.Boolean(
        string="Has Reseller Portal Access",
        compute="_compute_has_reseller_portal_access",
        help=(
            "True when this reseller partner has a linked active user "
            "in the Reseller Portal User group."
        ),
    )

    @api.constrains("reseller_partner_id", "is_reseller")
    def _check_reseller_partner_id(self):
        for partner in self:
            reseller = partner.reseller_partner_id
            if not reseller:
                continue
            if reseller.id == partner.id:
                raise ValidationError(_("A partner cannot be its own reseller."))
            if not reseller.is_reseller:
                raise ValidationError(
                    _("Partner '%s' is not flagged as a reseller.")
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
            "phone": self.phone or "",
            "city": self.city or "",
            "country_name": self.country_id.name or "",
        }

    @api.depends("user_ids", "user_ids.active", "user_ids.group_ids", "is_reseller")
    def _compute_has_reseller_portal_access(self):
        reseller_group = self.env.ref(
            "nakivo_reseller_portal.group_reseller_portal_user",
            raise_if_not_found=False,
        )
        for partner in self:
            if not partner.is_reseller or not reseller_group:
                partner.has_reseller_portal_access = False
                continue
            active_users = partner.sudo().user_ids.filtered(lambda u: u.active)
            partner.has_reseller_portal_access = bool(
                active_users.filtered(lambda u: reseller_group in u.group_ids)
            )

    def action_grant_reseller_portal_access(self):
        """Atomically grant portal access and add the user to the reseller group.

        Step 1 — create a portal user via portal.wizard (Odoo's standard mechanism).
        Step 2 — add that user to group_reseller_portal_user in the same transaction.

        Raises UserError for every precondition failure so the UI surfaces
        a clear message.
        """
        self.ensure_one()
        if not self.is_reseller:
            raise UserError(_("This partner is not marked as a reseller."))
        if not self.email:
            raise UserError(
                _("Set an email address on '%s' before granting portal access.")
                % self.display_name
            )

        reseller_group = self.env.ref(
            "nakivo_reseller_portal.group_reseller_portal_user"
        )

        # Step 1 — use portal.wizard to create/activate the portal user
        wizard = self.env["portal.wizard"].create(
            {"partner_ids": [Command.set(self.ids)]}
        )
        wizard_user = wizard.user_ids
        if not wizard_user:
            raise UserError(
                _("Could not initialize portal access for '%s'.") % self.display_name
            )
        if wizard_user.is_internal:
            raise UserError(
                _(
                    "'%s' is linked to an internal user and cannot be granted"
                    " portal access."
                )
                % self.display_name
            )

        if not wizard_user.is_portal:
            # Creates the user (or re-activates an archived one) and sends the invite.
            wizard_user.action_grant_access()

        # Step 2 — locate the freshly created/activated user and add to reseller group
        user = self.sudo().user_ids.filtered(lambda u: u.active and not u._is_public())
        if not user:
            raise UserError(
                _(
                    "Portal access was configured but no user account was found"
                    " for '%s'. Please refresh and try again."
                )
                % self.display_name
            )

        user.sudo().write({"group_ids": [Command.link(reseller_group.id)]})

        return {
            "type": "ir.actions.client",
            "tag": "display_notification",
            "params": {
                "title": _("Reseller Portal Access Granted"),
                "message": _("'%s' can now log in and access the Reseller Portal.")
                % self.display_name,
                "sticky": False,
                "type": "success",
            },
        }
