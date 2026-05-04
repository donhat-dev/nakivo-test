/** @odoo-module **/

import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useState } from "@odoo/owl";

export class PartnerPortalRoot extends Component {
    static template = "nakivo_reseller_portal.PartnerPortalRoot";
    static props = {
        apiBasePath: String,
        csrfToken: String,
    };

    setup() {
        this.http = useService("http");
        this.state = useState({
            activeTab: "opportunities",
            confirmingDeleteId: null,
            dashboard: this._emptyDashboard(),
            deletingId: null,
            error: "",
            form: {
                description: "",
                expected_revenue: "",
                name: "",
                partner_id: "",
            },
            loading: true,
            submitting: false,
        });

        onWillStart(async () => {
            await this.loadDashboard();
        });
    }

    get currentItems() {
        return this.state.dashboard[this.state.activeTab] || [];
    }

    get hasCustomers() {
        return this.state.dashboard.customers.length > 0;
    }

    get tabs() {
        return [
            {
                count: this.state.dashboard.opportunities.length,
                id: "opportunities",
                label: _t("Opportunities"),
            },
            {
                count: this.state.dashboard.quotations.length,
                id: "quotations",
                label: _t("Quotations"),
            },
            {
                count: this.state.dashboard.sales_orders.length,
                id: "sales_orders",
                label: _t("Sales Orders"),
            },
            {
                count: this.state.dashboard.invoices.length,
                id: "invoices",
                label: _t("Invoices"),
            },
            {
                count: this.state.dashboard.customers.length,
                id: "customers",
                label: _t("Customers"),
            },
        ];
    }

    _emptyDashboard() {
        return {
            customers: [],
            invoices: [],
            opportunities: [],
            quotations: [],
            sales_orders: [],
        };
    }

    _extractErrorMessage(result) {
        if (result && result.error && result.error.message) {
            return result.error.message;
        }
        return _t("Unexpected server response.");
    }

    _normalizeDashboard(data) {
        const dashboard = this._emptyDashboard();
        for (const key of Object.keys(dashboard)) {
            dashboard[key] = Array.isArray(data[key]) ? data[key] : [];
        }
        return dashboard;
    }

    _requireSuccess(result) {
        if (!result || result.success !== true) {
            throw new Error(this._extractErrorMessage(result));
        }
        return result.data || {};
    }

    _resetForm() {
        this.state.form.description = "";
        this.state.form.expected_revenue = "";
        this.state.form.name = "";
        this.state.form.partner_id = "";
    }

    formatAmount(amount, currencyName) {
        if (amount === false || amount === null || amount === undefined) {
            return "-";
        }
        return currencyName ? `${amount} ${currencyName}` : `${amount}`;
    }

    getTabButtonClass(tabId) {
        return tabId === this.state.activeTab
            ? "btn btn-primary rounded-pill"
            : "btn btn-outline-secondary rounded-pill";
    }

    async loadDashboard() {
        this.state.error = "";
        this.state.loading = true;
        try {
            const result = await this.http.get(
                `${this.props.apiBasePath}/dashboard`,
            );
            const data = this._requireSuccess(result);
            this.state.dashboard = this._normalizeDashboard(data);
        } catch (error) {
            this.state.error =
                error.message || _t("Unable to load reseller portal data.");
        } finally {
            this.state.loading = false;
        }
    }

    onClickTab(ev) {
        this.state.activeTab = ev.currentTarget.dataset.tab;
    }

    async createOpportunity() {
        this.state.error = "";
        this.state.submitting = true;
        try {
            const formData = new FormData();
            formData.append("csrf_token", this.props.csrfToken);
            formData.append("name", this.state.form.name);

            if (this.state.form.partner_id) {
                formData.append("partner_id", this.state.form.partner_id);
            }
            if (this.state.form.expected_revenue) {
                formData.append(
                    "expected_revenue",
                    this.state.form.expected_revenue,
                );
            }
            if (this.state.form.description) {
                formData.append("description", this.state.form.description);
            }

            const result = await this.http.post(
                `${this.props.apiBasePath}/opportunities`,
                formData,
            );
            this._requireSuccess(result);
            this._resetForm();
            this.state.activeTab = "opportunities";
            await this.loadDashboard();
        } catch (error) {
            this.state.error =
                error.message || _t("Unable to create the opportunity.");
        } finally {
            this.state.submitting = false;
        }
    }

    requestDeleteConfirm(ev) {
        this.state.confirmingDeleteId = Number(
            ev.currentTarget.dataset.id || 0,
        );
    }

    cancelDelete() {
        this.state.confirmingDeleteId = null;
    }

    async confirmDelete() {
        const opportunityId = this.state.confirmingDeleteId;
        if (!opportunityId) {
            return;
        }
        this.state.confirmingDeleteId = null;
        this.state.error = "";
        this.state.deletingId = opportunityId;
        try {
            const url = `${this.props.apiBasePath}/opportunities/${opportunityId}?csrf_token=${encodeURIComponent(this.props.csrfToken)}`;
            const response = await browser.fetch(url, { method: "DELETE" });
            const result = await response.json();
            this._requireSuccess(result);
            await this.loadDashboard();
        } catch (error) {
            this.state.error =
                error.message || _t("Unable to delete the opportunity.");
        } finally {
            this.state.deletingId = null;
        }
    }
}

registry
    .category("public_components")
    .add("nakivo_reseller_portal.PartnerPortalRoot", PartnerPortalRoot);
