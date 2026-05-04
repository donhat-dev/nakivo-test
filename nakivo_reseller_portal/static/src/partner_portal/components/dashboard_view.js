/** @odoo-module **/

import { Component } from "@odoo/owl";
import { DashboardChart } from "./dashboard_chart";

export class DashboardView extends Component {
    static template = "nakivo_reseller_portal.DashboardView";
    static components = { DashboardChart };
    static props = {
        cards: Array,
        stats: Array,
        charts: Array,
        onNavigate: Function,
        loading: Boolean,
        lastUpdated: { type: String, optional: true },
        onRefresh: Function,
    };

    onCardClick(ev) {
        const sectionId = ev.currentTarget.dataset.section;
        if (sectionId) {
            this.props.onNavigate(sectionId);
        }
    }

    chartColClass(chart) {
        switch (chart.size) {
            case "xl":
                return "col-12 col-lg-8";
            case "sm":
                return "col-12 col-lg-4";
            default:
                return "col-12 col-lg-6";
        }
    }
}
