/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class CreateOpportunityModal extends Component {
    static template = "nakivo_reseller_portal.CreateOpportunityModal";
    static props = {
        customers: Array,
        apiBasePath: String,
        csrfToken: String,
        onClose: Function,
        onCreated: Function,
    };

    setup() {
        this.http = useService("http");
        this.state = useState({
            name: "",
            partner_id: "",
            email: "",
            phone: "",
            expected_revenue: "",
            error: "",
            submitting: false,
        });
    }

    get hasCustomers() {
        return this.props.customers.length > 0;
    }

    async onSubmit(ev) {
        ev.preventDefault();
        if (!this.state.name.trim()) {
            this.state.error = _t("Opportunity name is required.");
            return;
        }
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
                formData.append("expected_revenue", this.state.expected_revenue);
            }
            if (this.state.email) {
                formData.append("email", this.state.email);
            }
            if (this.state.phone) {
                formData.append("phone", this.state.phone);
            }
            const result = await this.http.post(
                `${this.props.apiBasePath}/opportunities`,
                formData
            );
            if (!result || result.success !== true) {
                throw new Error(
                    result?.error?.message ||
                        _t("Unable to create the opportunity.")
                );
            }
            this.props.onCreated();
        } catch (e) {
            this.state.error =
                e.message || _t("Unable to create the opportunity.");
        } finally {
            this.state.submitting = false;
        }
    }

    onBackdropClick(ev) {
        // Only close when clicking the backdrop itself, not the card
        if (ev.target === ev.currentTarget) {
            this.props.onClose();
        }
    }

    onClose() {
        this.props.onClose();
    }
}
