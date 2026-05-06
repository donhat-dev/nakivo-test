# DECISIONS.md

Design and architectural decisions made during development.
This file is for reference and context — not a changelog.

---

## UI Reference

**Decision:** Use the Softr Partner Portal template as the primary UI reference for layout, navigation patterns, and component structure.

**References:**

- Live demo: https://partner-portal-sdb.softr.app/leads?show-toolbar=true
- Template page: https://www.softr.io/templates/partner-portal

**Context:**
The Softr partner portal (branded as "Mesh | PARTNERS") demonstrates a well-established UX pattern for B2B portals — flat sidebar navigation with collapsible groups, full-width list views with inline search + CTA toolbar, and modal-based create forms. These patterns are familiar to business users, require minimal learning, and map naturally onto Odoo's portal model.

**What we borrowed:**

- Sidebar nav structure: top-level items + collapsible groups with child links (e.g., People → Leads, Contacts)
- Active nav item highlighted with a solid background accent chip
- List page layout: page title + subtitle, then a toolbar row (search left / CTA right), then a typed-column table
- Column header icons indicating data type (T for text, tag, envelope, phone handset)
- Empty state: centered inbox icon + "No results found. Please adjust your filter." with a clickable filter link
- Create modal: white card on dimmed backdrop, X close button top-right, gray-fill borderless inputs, single-column field layout, Cancel + primary Add footer

**What we did NOT borrow:**

- Color palette — we keep the DESIGN.md tokens (`#714B67` primary, `#F8F6F8` canvas, etc.)
- Typography — we keep Inter as defined in DESIGN.md
- Softr-specific branding, logo, or exact wording

---

## Option A: React SPA in Odoo (final)

**Decision:** Build the reviewer-facing frontend in React, with the SPA authored in `frontend/` and embedded into the Odoo route `/my/reseller-portal`.

**Rationale:**

- Keeps the frontend experience in React rather than continuing with Owl as the primary UI
- Preserves Odoo as the trust boundary by reusing `/web/session/authenticate` plus session cookies
- Gives the frontend a clearer routing, state-management, and component model for reviewer-facing UX
- Fits the deployed stack by baking the built SPA into the Odoo addon image and route

**Trade-off accepted:** This adds a frontend build step, but the UX and implementation path are clearer than maintaining the primary experience inside Owl.

---

## Sidebar: Collapsible Nav Groups vs Flat Nav

**Decision:** Use collapsible nav groups for Sales (Quotations + Sales Orders) and keep Opportunities, Invoices, Customers as top-level items.

**Rationale:** Mirroring the reference UI's People → Leads/Contacts pattern. Reduces visual noise when the portal grows. Groups are expanded by default for their primary section.

---

## List View: Unified Toolbar (Search + CTA in one row)

**Decision:** Place the search bar and the "+ New Opportunity" CTA button in a single horizontal toolbar row above the table, rather than separate header sections.

**Rationale:** Directly mirrors the reference UI. Reduces vertical scroll and keeps the primary action always visible alongside filtering. Consistent with how SaaS B2B portals handle list-level actions.

---

## Create Form: Modal vs Dedicated Page

**Decision:** Use a centered modal overlay for the create form, not a full-page navigation.

**Rationale:** The reference UI uses a modal for "Add Contact or Lead". Modal keeps the user in context (list still visible behind backdrop), which is appropriate for a short form. If the form grows significantly (>8 fields), this decision should be revisited in favour of a dedicated route.

---

## Input Style: Gray-fill, No Border

**Decision:** Form inputs use a light gray background fill (`#F3F4F6`) with no visible border instead of a white background with border.

**Rationale:** Observed in the reference UI screenshots. Reduces visual clutter in modal forms and aligns with modern SaaS form aesthetics. Labels are placed above inputs (not inside as placeholders) to maintain readability when filled.

---

## Phone Field: Country-code Prefix Selector

**Decision:** The Phone field in the create form includes a country-code dropdown prefix (defaulting to VN).

**Rationale:** Directly observed in the reference UI ("VN ∨" prefix on the phone input). Necessary for international resellers. Implementation delegates to a dedicated React field composition around a country list.
