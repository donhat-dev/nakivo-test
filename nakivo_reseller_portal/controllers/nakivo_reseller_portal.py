from __future__ import annotations

import json

from odoo import _
from odoo.exceptions import AccessError
from odoo.http import request, route

from odoo.addons.nakivo_base_rest.exceptions import (
    PermissionDeniedException,
    ValidationException,
)
from odoo.addons.nakivo_base_rest.handler import BaseRestHandler
from odoo.addons.portal.controllers.portal import CustomerPortal

from ..constants import (
    API_BASE_PATH,
    DASHBOARD_LIMIT,
    PORTAL_PAGE_ROUTE,
    RESELLER_PORTAL_GROUP_XML_ID,
)
from ..exceptions import OpportunityNotFoundException
from ..schemas import CreateOpportunityPayload


class PartnerResellerPortalController(CustomerPortal, BaseRestHandler):
    def _ensure_portal_page_access(self):
        user = request.env.user
        if not user.has_group(RESELLER_PORTAL_GROUP_XML_ID) or not user.partner_id:
            raise AccessError(_("You do not have access to the reseller portal."))
        return user.partner_id

    def _get_reseller_partner(self):
        user = request.env.user
        if not user.has_group(RESELLER_PORTAL_GROUP_XML_ID):
            raise PermissionDeniedException(
                _("You do not have access to the reseller portal.")
            )

        reseller_partner = user.partner_id
        if not reseller_partner:
            raise PermissionDeniedException(
                _("The current user is not linked to a partner record.")
            )
        return reseller_partner

    # -------------------------------------------------------------------------
    # Portal home integration (Gap 1)
    # -------------------------------------------------------------------------

    def _prepare_home_portal_values(self, counters):
        values = super()._prepare_home_portal_values(counters)
        if "reseller_portal_count" in counters and request.env.user.has_group(
            RESELLER_PORTAL_GROUP_XML_ID
        ):
            partner = request.env.user.partner_id
            values["reseller_portal_count"] = (
                request.env["crm.lead"]
                .sudo()
                .search_count(request.env["crm.lead"]._reseller_portal_domain(partner))
            )
        return values

    def _get_dashboard_payload(self):
        reseller_partner = self._get_reseller_partner()
        opportunity_model = request.env["crm.lead"].sudo()
        order_model = request.env["sale.order"].sudo()
        invoice_model = request.env["account.move"].sudo()
        customer_model = request.env["res.partner"].sudo()

        opportunities = opportunity_model.search(
            opportunity_model._reseller_portal_domain(reseller_partner),
            limit=DASHBOARD_LIMIT,
            order="write_date desc, id desc",
        )
        quotations = order_model.search(
            order_model._reseller_portal_domain(reseller_partner)
            + [("state", "in", ["draft", "sent"])],
            limit=DASHBOARD_LIMIT,
            order="date_order desc, id desc",
        )
        sales_orders = order_model.search(
            order_model._reseller_portal_domain(reseller_partner)
            + [("state", "in", ["sale", "done"])],
            limit=DASHBOARD_LIMIT,
            order="date_order desc, id desc",
        )
        invoices = invoice_model.search(
            invoice_model._reseller_portal_domain(reseller_partner),
            limit=DASHBOARD_LIMIT,
            order="invoice_date desc, id desc",
        )
        customers = customer_model.search(
            customer_model._reseller_portal_domain(reseller_partner),
            limit=DASHBOARD_LIMIT,
            order="name asc, id asc",
        )

        data = {
            "opportunities": [lead._reseller_portal_values() for lead in opportunities],
            "quotations": [order._reseller_portal_values() for order in quotations],
            "sales_orders": [order._reseller_portal_values() for order in sales_orders],
            "invoices": [move._reseller_portal_values() for move in invoices],
            "customers": [partner._reseller_portal_values() for partner in customers],
        }
        meta = {
            "limit": DASHBOARD_LIMIT,
            "counts": {key: len(value) for key, value in data.items()},
        }
        return self._make_success_response(data, meta=meta)

    def _get_opportunities_payload(self):
        reseller_partner = self._get_reseller_partner()
        opportunity_model = request.env["crm.lead"].sudo()
        domain = opportunity_model._reseller_portal_domain(reseller_partner)
        opportunities = opportunity_model.search(
            domain,
            limit=DASHBOARD_LIMIT,
            order="write_date desc, id desc",
        )
        total = opportunity_model.search_count(domain)
        return self._make_success_response(
            [lead._reseller_portal_values() for lead in opportunities],
            meta={
                "limit": DASHBOARD_LIMIT,
                "total": total,
            },
        )

    def _create_opportunity_payload(self):
        reseller_partner = self._get_reseller_partner()
        payload = self._validate_payload(CreateOpportunityPayload)
        lead_model = request.env["crm.lead"]
        customer_model = request.env["res.partner"].sudo()

        values = lead_model._prepare_reseller_portal_opportunity_vals(
            payload.model_dump(exclude_none=True),
            reseller_partner,
        )

        if payload.partner_id:
            customer = customer_model.search(
                customer_model._reseller_portal_domain(reseller_partner)
                + [("id", "=", payload.partner_id)],
                limit=1,
            )
            if not customer:
                raise ValidationException(_("The selected customer is not available."))
            values["partner_id"] = customer.id

        opportunity = lead_model.sudo().create(values)
        return self._make_success_response(
            opportunity._reseller_portal_values(),
            status=201,
        )

    def _delete_opportunity_payload(self, opportunity_id: int):
        reseller_partner = self._get_reseller_partner()
        lead_model = request.env["crm.lead"].sudo()
        opportunity = lead_model.search(
            lead_model._reseller_portal_domain(reseller_partner)
            + [("id", "=", opportunity_id)],
            limit=1,
        )
        if not opportunity:
            raise OpportunityNotFoundException()

        deleted_id = opportunity.id
        opportunity.unlink()
        return self._make_success_response({"id": deleted_id, "deleted": True})

    @route(
        f"{PORTAL_PAGE_ROUTE}",
        type="http",
        auth="user",
        website=True,
        sitemap=False,
        readonly=True,
    )
    def reseller_portal_page(self, **kwargs):
        self._ensure_portal_page_access()
        values = self._prepare_portal_layout_values()
        values.update(
            {
                "page_name": "nakivo_reseller_portal",
                "component_props_json": json.dumps(
                    {
                        "apiBasePath": API_BASE_PATH,
                        "csrfToken": request.csrf_token(),
                        "userName": request.env.user.name,
                    }
                ),
            }
        )
        return request.render(
            "nakivo_reseller_portal.portal_my_reseller_portal", values
        )

    @route(
        f"{API_BASE_PATH}/dashboard",
        methods=["GET"],
        type="http",
        auth="user",
        website=True,
        sitemap=False,
        readonly=True,
    )
    def reseller_portal_dashboard(self, **kwargs):
        return self._dispatch_api(self._get_dashboard_payload)

    @route(
        f"{API_BASE_PATH}/opportunities",
        methods=["GET"],
        type="http",
        auth="user",
        website=True,
        sitemap=False,
        readonly=True,
    )
    def reseller_portal_opportunities_list(self, **kwargs):
        return self._dispatch_api(self._get_opportunities_payload)

    @route(
        f"{API_BASE_PATH}/opportunities",
        methods=["POST"],
        type="http",
        auth="user",
        website=True,
        sitemap=False,
    )
    def reseller_portal_opportunity_create(self, **kwargs):
        return self._dispatch_api(self._create_opportunity_payload)

    @route(
        f"{API_BASE_PATH}/opportunities/<int:opportunity_id>",
        methods=["DELETE"],
        type="http",
        auth="user",
        website=True,
        sitemap=False,
    )
    def reseller_portal_opportunity_detail(self, opportunity_id: int, **kwargs):
        return self._dispatch_api(
            lambda: self._delete_opportunity_payload(opportunity_id)
        )

    # -------------------------------------------------------------------------
    # QWeb portal list pages (Gap 2)
    # -------------------------------------------------------------------------

    @route(
        f"{PORTAL_PAGE_ROUTE}/opportunities",
        type="http",
        auth="user",
        website=True,
        sitemap=False,
        readonly=True,
    )
    def reseller_portal_opportunities_page(self, **kwargs):
        reseller_partner = self._ensure_portal_page_access()
        lead_model = request.env["crm.lead"].sudo()
        opportunities = lead_model.search(
            lead_model._reseller_portal_domain(reseller_partner),
            limit=DASHBOARD_LIMIT,
            order="write_date desc, id desc",
        )
        values = self._prepare_portal_layout_values()
        values.update(
            {
                "page_name": "reseller_opportunities",
                "opportunities": opportunities,
            }
        )
        return request.render(
            "nakivo_reseller_portal.portal_reseller_opportunities", values
        )

    @route(
        f"{PORTAL_PAGE_ROUTE}/orders",
        type="http",
        auth="user",
        website=True,
        sitemap=False,
        readonly=True,
    )
    def reseller_portal_orders_page(self, **kwargs):
        reseller_partner = self._ensure_portal_page_access()
        order_model = request.env["sale.order"].sudo()
        base_domain = order_model._reseller_portal_domain(reseller_partner)
        quotations = order_model.search(
            base_domain + [("state", "in", ["draft", "sent"])],
            limit=DASHBOARD_LIMIT,
            order="date_order desc, id desc",
        )
        sales_orders = order_model.search(
            base_domain + [("state", "in", ["sale", "done"])],
            limit=DASHBOARD_LIMIT,
            order="date_order desc, id desc",
        )
        values = self._prepare_portal_layout_values()
        values.update(
            {
                "page_name": "reseller_orders",
                "quotations": quotations,
                "sales_orders": sales_orders,
            }
        )
        return request.render("nakivo_reseller_portal.portal_reseller_orders", values)

    @route(
        f"{PORTAL_PAGE_ROUTE}/invoices",
        type="http",
        auth="user",
        website=True,
        sitemap=False,
        readonly=True,
    )
    def reseller_portal_invoices_page(self, **kwargs):
        reseller_partner = self._ensure_portal_page_access()
        invoice_model = request.env["account.move"].sudo()
        invoices = invoice_model.search(
            invoice_model._reseller_portal_domain(reseller_partner),
            limit=DASHBOARD_LIMIT,
            order="invoice_date desc, id desc",
        )
        values = self._prepare_portal_layout_values()
        values.update(
            {
                "page_name": "reseller_invoices",
                "invoices": invoices,
            }
        )
        return request.render("nakivo_reseller_portal.portal_reseller_invoices", values)

    @route(
        f"{PORTAL_PAGE_ROUTE}/customers",
        type="http",
        auth="user",
        website=True,
        sitemap=False,
        readonly=True,
    )
    def reseller_portal_customers_page(self, **kwargs):
        reseller_partner = self._ensure_portal_page_access()
        partner_model = request.env["res.partner"].sudo()
        customers = partner_model.search(
            partner_model._reseller_portal_domain(reseller_partner),
            limit=DASHBOARD_LIMIT,
            order="name asc, id asc",
        )
        values = self._prepare_portal_layout_values()
        values.update(
            {
                "page_name": "reseller_customers",
                "customers": customers,
            }
        )
        return request.render(
            "nakivo_reseller_portal.portal_reseller_customers", values
        )
