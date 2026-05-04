/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { Component, useState } from "@odoo/owl";

export class OpportunityForm extends Component {
    static template = "nakivo_reseller_portal.OpportunityForm";
    static props = {
        apiBasePath: String,
        csrfToken: String,
        customers: Array,
        onCreated: Function,
    };

    setup() {
        this.http = useService("http");
        this.state = useState({
            description: "",
            error: "",
            expected_revenue: "",
            name: "",
            partner_id: "",
            submitting: false,
        });
    }

    get hasCustomers() {
        return this.props.customers.length > 0;
    }

    _reset() {
        this.state.description = "";
        this.state.error = "";
        this.state.expected_revenue = "";
        this.state.name = "";
        this.state.partner_id = "";
    }

    async createOpportunity() {
        this.state.error = "";
        this.state.submitting = true;
        try {
            const formData = new FormData();
            formData.append("csrf_token", this.props.csrfToken);
            formData.append("name", this.state.name);
            if (this.state.partner_id) {
                formData.append("partner_id", this.state.partner_id);
            }
            if (this.state.expected_revenue) {
                formData.append(
                    "expected_revenue",
                    this.state.expected_revenue,
                );
            }
            if (this.state.description) {
                formData.append("description", this.state.description);
            }
            const result = await this.http.post(
                `${this.props.apiBasePath}/opportunities`,
                formData,
            );
            if (!result || result.success !== true) {
                const message =
                    result?.error?.message || _t("Unexpected server response.");
                throw new Error(message);
            }
            this._reset();
            this.props.onCreated();
        } catch (error) {
            this.state.error =
                error.message || _t("Unable to create the opportunity.");
        } finally {
            this.state.submitting = false;
        }
    }
}
