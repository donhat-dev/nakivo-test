from __future__ import annotations

from pydantic import ValidationError as PydanticValidationError

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase, tagged

from ..schemas import CreateOpportunityPayload


@tagged("post_install", "-at_install")
class TestResellerPortalSecurity(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.partner_model = cls.env["res.partner"]
        cls.lead_model = cls.env["crm.lead"]

        cls.reseller_a = cls.partner_model.create(
            {"name": "Reseller A", "is_reseller": True}
        )
        cls.reseller_b = cls.partner_model.create(
            {"name": "Reseller B", "is_reseller": True}
        )
        cls.customer_a = cls.partner_model.create(
            {
                "name": "Customer A",
                "reseller_partner_id": cls.reseller_a.id,
            }
        )
        cls.customer_b = cls.partner_model.create(
            {
                "name": "Customer B",
                "reseller_partner_id": cls.reseller_b.id,
            }
        )
        cls.lead_a = cls.lead_model.create(
            {
                "name": "Opportunity A",
                "type": "opportunity",
                "partner_id": cls.customer_a.id,
                "reseller_partner_id": cls.reseller_a.id,
            }
        )
        cls.lead_b = cls.lead_model.create(
            {
                "name": "Opportunity B",
                "type": "opportunity",
                "partner_id": cls.customer_b.id,
                "reseller_partner_id": cls.reseller_b.id,
            }
        )

    def test_prepare_opportunity_values_ignores_client_reseller(self):
        values = self.lead_model._prepare_reseller_portal_opportunity_vals(
            {
                "name": "Portal Opportunity",
                "reseller_partner_id": self.reseller_b.id,
            },
            self.reseller_a,
        )

        self.assertEqual(values["reseller_partner_id"], self.reseller_a.id)
        self.assertEqual(values["type"], "opportunity")

    def test_reseller_portal_domain_scopes_to_current_reseller(self):
        leads = self.lead_model.search(
            self.lead_model._reseller_portal_domain(self.reseller_a)
        )

        self.assertIn(self.lead_a, leads)
        self.assertNotIn(self.lead_b, leads)

    def test_reseller_partner_must_be_flagged_as_reseller(self):
        non_reseller = self.partner_model.create(
            {"name": "Plain Customer", "is_reseller": False}
        )
        with self.assertRaises(ValidationError):
            self.partner_model.create(
                {
                    "name": "Bad Customer",
                    "reseller_partner_id": non_reseller.id,
                }
            )

    def test_partner_cannot_be_its_own_reseller(self):
        partner = self.partner_model.create(
            {"name": "Self Reseller", "is_reseller": True}
        )
        with self.assertRaises(ValidationError):
            partner.write({"reseller_partner_id": partner.id})

    def test_create_opportunity_payload_rejects_unknown_fields(self):
        with self.assertRaises(PydanticValidationError):
            CreateOpportunityPayload.model_validate(
                {
                    "name": "Portal Opportunity",
                    "unexpected": "not-allowed",
                }
            )
