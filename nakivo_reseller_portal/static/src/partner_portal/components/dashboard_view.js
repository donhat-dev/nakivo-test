/** @odoo-module **/

import { Component } from "@odoo/owl";

export class DashboardView extends Component {
    static template = "nakivo_reseller_portal.DashboardView";
    static props = {
        cards: Array,
        stats: Array,
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
}
