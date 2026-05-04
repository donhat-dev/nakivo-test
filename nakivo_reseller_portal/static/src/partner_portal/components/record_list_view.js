/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { DeleteButton } from "./delete_button";

export class RecordListView extends Component {
    static template = "nakivo_reseller_portal.RecordListView";
    static components = { DeleteButton };
    static props = {
        title: String,
        subtitle: { type: String, optional: true },
        columns: Array,
        records: Array,
        loading: Boolean,
        showCreateButton: Boolean,
        onCreateClick: Function,
        // Optional: { apiBasePath, csrfToken, onDeleted } — present only for opportunities
        deleteAction: { optional: true },
    };

    setup() {
        this.state = useState({ searchQuery: "" });
    }

    get filteredRecords() {
        const q = this.state.searchQuery.toLowerCase().trim();
        if (!q) {
            return this.props.records;
        }
        return this.props.records.filter(
            (r) =>
                (r.name || "").toLowerCase().includes(q) ||
                (r.partner_name || "").toLowerCase().includes(q)
        );
    }

    onSearchInput(ev) {
        this.state.searchQuery = ev.target.value;
    }

    onCreateClick() {
        this.props.onCreateClick();
    }

    formatAmount(amount, currencyName) {
        if (amount === false || amount === null || amount === undefined) {
            return "-";
        }
        return currencyName ? `${amount} ${currencyName}` : String(amount);
    }

    getCellValue(record, col) {
        const val = record[col.key];
        if (col.key === "amount_total" || col.key === "expected_revenue") {
            return this.formatAmount(val, record.currency_name || "");
        }
        if (val === false || val === null || val === undefined) {
            return "-";
        }
        return val;
    }
}
