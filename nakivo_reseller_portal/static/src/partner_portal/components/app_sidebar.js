/** @odoo-module **/

import { Component, useState } from "@odoo/owl";

export class AppSidebar extends Component {
    static template = "nakivo_reseller_portal.AppSidebar";
    static props = {
        sections: Array,
        activeSection: String,
        userName: String,
        onNavigate: Function,
        collapsed: { type: Boolean, optional: true },
        onToggleSidebar: Function,
    };

    setup() {
        // Plain object for Owl reactivity (Set is not reactive)
        this.state = useState({ expanded: { opportunities_group: true } });
    }

    isExpanded(groupId) {
        return !!this.state.expanded[groupId];
    }

    isActive(sectionId) {
        return this.props.activeSection === sectionId;
    }

    onGroupToggle(ev) {
        const groupId = ev.currentTarget.dataset.group;
        if (groupId) {
            this.state.expanded[groupId] = !this.state.expanded[groupId];
        }
    }

    onNavClick(ev) {
        const sectionId = ev.currentTarget.dataset.section;
        if (sectionId) {
            this.props.onNavigate(sectionId);
        }
    }
}
