/** @odoo-module **/

import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";
import { Component, useState } from "@odoo/owl";

export class DeleteButton extends Component {
    static template = "nakivo_reseller_portal.DeleteButton";
    static props = {
        recordId: Number,
        apiBasePath: String,
        csrfToken: String,
        onDeleted: Function,
    };

    setup() {
        this.state = useState({ confirming: false, deleting: false });
    }

    onTrashClick() {
        this.state.confirming = true;
    }

    onCancelConfirm() {
        this.state.confirming = false;
    }

    async onConfirmDelete() {
        this.state.deleting = true;
        try {
            const url = `${this.props.apiBasePath}/opportunities/${this.props.recordId}?csrf_token=${encodeURIComponent(this.props.csrfToken)}`;
            const response = await browser.fetch(url, { method: "DELETE" });
            const result = await response.json();
            if (!result || result.success !== true) {
                throw new Error(
                    result?.error?.message || _t("Delete failed.")
                );
            }
            this.props.onDeleted(this.props.recordId);
        } catch (_e) {
            // Reset so the user can retry; errors bubble via onDeleted not being called
            this.state.confirming = false;
        } finally {
            this.state.deleting = false;
        }
    }
}
