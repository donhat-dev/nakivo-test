/** @odoo-module **/

import { Component } from "@odoo/owl";

export class DashboardTabBar extends Component {
    static template = "nakivo_reseller_portal.DashboardTabBar";
    static props = {
        activeTab: String,
        onTabChange: Function,
        tabs: Array,
    };

    tabClass(tabId) {
        return tabId === this.props.activeTab
            ? "btn btn-primary rounded-pill"
            : "btn btn-outline-secondary rounded-pill";
    }

    onClickTab(ev) {
        this.props.onTabChange(ev.currentTarget.dataset.tab);
    }
}
