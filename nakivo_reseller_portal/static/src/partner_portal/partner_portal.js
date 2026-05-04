/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useState } from "@odoo/owl";

import { AppSidebar } from "./components/app_sidebar";
import { CreateOpportunityModal } from "./components/create_opportunity_modal";
import { DashboardView } from "./components/dashboard_view";
import { RecordListView } from "./components/record_list_view";

export class PartnerPortalRoot extends Component {
    static template = "nakivo_reseller_portal.PartnerPortalRoot";
    static components = {
        AppSidebar,
        CreateOpportunityModal,
        DashboardView,
        RecordListView,
    };
    static props = {
        apiBasePath: String,
        csrfToken: String,
        userName: String,
    };

    setup() {
        this.http = useService("http");
        this.state = useState({
            activeSection: "dashboard",
            dashboard: this._emptyDashboard(),
            error: "",
            lastUpdated: "",
            loading: true,
            showCreateModal: false,
        });

        onWillStart(async () => {
            await this.loadDashboard();
        });
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    _emptyDashboard() {
        return {
            customers: [],
            invoices: [],
            opportunities: [],
            quotations: [],
            sales_orders: [],
        };
    }

    _normalizeDashboard(data) {
        const dashboard = this._emptyDashboard();
        for (const key of Object.keys(dashboard)) {
            dashboard[key] = Array.isArray(data[key]) ? data[key] : [];
        }
        return dashboard;
    }

    // -------------------------------------------------------------------------
    // Computed properties
    // -------------------------------------------------------------------------

    /** Nav items passed to AppSidebar */
    get sidebarSections() {
        const d = this.state.dashboard;
        return [
            {
                id: "dashboard",
                label: _t("Dashboard"),
                iconClass: "fa-th-large",
                children: [],
            },
            {
                id: "opportunities_group",
                label: _t("Opportunities"),
                iconClass: "fa-bullseye",
                children: [
                    {
                        id: "opportunities",
                        label: _t("All Opportunities"),
                        count: d.opportunities.length,
                    },
                ],
            },
            {
                id: "sales_group",
                label: _t("Sales"),
                iconClass: "fa-shopping-cart",
                children: [
                    {
                        id: "quotations",
                        label: _t("Quotations"),
                        iconClass: "fa-file-text-o",
                        count: d.quotations.length,
                    },
                    {
                        id: "sales_orders",
                        label: _t("Sales Orders"),
                        iconClass: "fa-shopping-cart",
                        count: d.sales_orders.length,
                    },
                ],
            },
            {
                id: "invoices",
                label: _t("Invoices"),
                iconClass: "fa-file-text",
                count: d.invoices.length,
                children: [],
            },
            {
                id: "customers",
                label: _t("Customers"),
                iconClass: "fa-users",
                count: d.customers.length,
                children: [],
            },
        ];
    }

    /** Quicklink cards for DashboardView */
    get dashboardCards() {
        const d = this.state.dashboard;
        return [
            {
                id: "card-opp",
                sectionId: "opportunities",
                label: _t("Opportunities"),
                count: d.opportunities.length,
                iconClass: "fa-bullseye",
            },
            {
                id: "card-quot",
                sectionId: "quotations",
                label: _t("Quotations"),
                count: d.quotations.length,
                iconClass: "fa-file-text-o",
            },
            {
                id: "card-so",
                sectionId: "sales_orders",
                label: _t("Sales Orders"),
                count: d.sales_orders.length,
                iconClass: "fa-shopping-cart",
            },
            {
                id: "card-inv",
                sectionId: "invoices",
                label: _t("Invoices"),
                count: d.invoices.length,
                iconClass: "fa-file-text",
            },
            {
                id: "card-cust",
                sectionId: "customers",
                label: _t("Customers"),
                count: d.customers.length,
                iconClass: "fa-users",
            },
        ];
    }

    /** Summary stats shown at the top of the dashboard */
    get dashboardStats() {
        const opps = this.state.dashboard.opportunities || [];
        const totalRevenue = opps.reduce(
            (sum, o) => sum + (o.expected_revenue || 0),
            0
        );
        const revenueLabel =
            "$" +
            totalRevenue.toLocaleString("en", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        return [
            {
                id: "stat-opps",
                label: _t("Total Opportunities"),
                value: opps.length,
            },
            {
                id: "stat-revenue",
                label: _t("Total Revenue"),
                value: revenueLabel,
            },
        ];
    }

    /** Records for the currently active section */
    get currentRecords() {
        return this.state.dashboard[this.state.activeSection] || [];
    }

    /**
     * Column/meta config for the active section.
     * Returns null when activeSection is "dashboard".
     */
    get currentSectionConfig() {
        const configs = {
            opportunities: {
                title: _t("Opportunities"),
                subtitle: _t(
                    "All opportunities where you are the assigned reseller."
                ),
                columns: [
                    { key: "name", label: _t("Opportunity"), headerIcon: "T" },
                    {
                        key: "partner_name",
                        label: _t("Customer"),
                        headerIcon: "T",
                    },
                    {
                        key: "stage_name",
                        label: _t("Stage"),
                        headerIcon: "tag",
                        type: "badge",
                    },
                    {
                        key: "expected_revenue",
                        label: _t("Exp. Revenue"),
                        headerIcon: "T",
                    },
                ],
                showCreateButton: true,
            },
            quotations: {
                title: _t("Quotations"),
                subtitle: _t(
                    "All quotations where you are listed as the reseller."
                ),
                columns: [
                    { key: "name", label: _t("Quotation"), headerIcon: "T" },
                    {
                        key: "partner_name",
                        label: _t("Customer"),
                        headerIcon: "T",
                    },
                    { key: "date_order", label: _t("Date"), headerIcon: "T" },
                    {
                        key: "amount_total",
                        label: _t("Total"),
                        headerIcon: "T",
                    },
                    {
                        key: "state",
                        label: _t("Status"),
                        headerIcon: "tag",
                        type: "badge",
                    },
                ],
                showCreateButton: false,
            },
            sales_orders: {
                title: _t("Sales Orders"),
                subtitle: _t(
                    "All sales orders where you are listed as the reseller."
                ),
                columns: [
                    { key: "name", label: _t("Order"), headerIcon: "T" },
                    {
                        key: "partner_name",
                        label: _t("Customer"),
                        headerIcon: "T",
                    },
                    { key: "date_order", label: _t("Date"), headerIcon: "T" },
                    {
                        key: "amount_total",
                        label: _t("Total"),
                        headerIcon: "T",
                    },
                    {
                        key: "state",
                        label: _t("Status"),
                        headerIcon: "tag",
                        type: "badge",
                    },
                ],
                showCreateButton: false,
            },
            invoices: {
                title: _t("Invoices"),
                subtitle: _t(
                    "All invoices where you are listed as the reseller."
                ),
                columns: [
                    { key: "name", label: _t("Invoice"), headerIcon: "T" },
                    {
                        key: "partner_name",
                        label: _t("Customer"),
                        headerIcon: "T",
                    },
                    {
                        key: "invoice_date",
                        label: _t("Date"),
                        headerIcon: "T",
                    },
                    {
                        key: "amount_total",
                        label: _t("Total"),
                        headerIcon: "T",
                    },
                    {
                        key: "payment_state",
                        label: _t("Payment"),
                        headerIcon: "tag",
                        type: "badge",
                    },
                ],
                showCreateButton: false,
            },
            customers: {
                title: _t("Customers"),
                subtitle: _t(
                    "All customers where you are listed as the reseller."
                ),
                columns: [
                    { key: "name", label: _t("Name"), headerIcon: "T" },
                    { key: "email", label: _t("Email"), headerIcon: "mail" },
                    { key: "phone", label: _t("Phone"), headerIcon: "phone" },
                    { key: "city", label: _t("City"), headerIcon: "T" },
                ],
                showCreateButton: false,
            },
        };
        return configs[this.state.activeSection] || null;
    }

    /**
     * Delete action config passed to RecordListView.
     * Only defined for the opportunities section.
     */
    get deleteAction() {
        if (this.state.activeSection !== "opportunities") {
            return undefined;
        }
        return {
            apiBasePath: this.props.apiBasePath,
            csrfToken: this.props.csrfToken,
            onDeleted: (id) => this.onOpportunityDeleted(id),
        };
    }

    // -------------------------------------------------------------------------
    // Data loading
    // -------------------------------------------------------------------------

    async loadDashboard() {
        this.state.error = "";
        this.state.loading = true;
        try {
            const result = await this.http.get(
                `${this.props.apiBasePath}/dashboard`
            );
            if (!result || result.success !== true) {
                throw new Error(
                    result?.error?.message ||
                        _t("Unable to load portal data.")
                );
            }
            this.state.dashboard = this._normalizeDashboard(result.data || {});
            this.state.lastUpdated = new Date().toLocaleTimeString("en", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            this.state.error =
                e.message || _t("Unable to load reseller portal data.");
        } finally {
            this.state.loading = false;
        }
    }

    // -------------------------------------------------------------------------
    // Event handlers
    // -------------------------------------------------------------------------

    onNavigate(sectionId) {
        this.state.activeSection = sectionId;
    }

    async onRefreshDashboard() {
        await this.loadDashboard();
    }

    onCreateClick() {
        this.state.showCreateModal = true;
    }

    onModalClose() {
        this.state.showCreateModal = false;
    }

    async onOpportunityCreated() {
        this.state.showCreateModal = false;
        await this.loadDashboard();
    }

    /** Optimistic removal — avoids a full dashboard reload after delete */
    onOpportunityDeleted(id) {
        this.state.dashboard.opportunities =
            this.state.dashboard.opportunities.filter((o) => o.id !== id);
    }
}

registry
    .category("public_components")
    .add("nakivo_reseller_portal.PartnerPortalRoot", PartnerPortalRoot);
