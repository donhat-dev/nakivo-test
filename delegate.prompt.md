# Delegate Prompt for Coding Agent

## 0. Context from Previous Conversation

This task is part of a technical assignment to build a **Partner Reseller Portal** using **Odoo 19 Community Edition**.
REF: `https://chatgpt.com/share/69f79f9f-97f0-8324-9c8e-1b10eb59bc75`
Original requirements:

```
TEST TASK
You will have 3 days to complete this Test. Please let responsible HR know once you have completed via Email/ Chat
Enter your answers directly in the document
Using AI is required

Business Requirement:
Build a Partner Portal for resellers to view and manage their data.

Example: As an Asus reseller of Sun Inc., after logging into Sun Inc’s Partner Portal, I should be able to see:
● All opportunities created by me
● All quotations, sales orders, invoices, and customers where I am listed as the reseller.
I should also be able to create new opportunities and delete existing ones.

Technical Requirement:
● Partner Portal: Develop a new frontend using JS, CSS, and HTML. Any modern JavaScript framework (React, Vue.js, Angular, etc.) is allowed.
● Backend: Odoo 19 Community Edition
```

Key context:

- The solution follows **Option A: Odoo-native approach (Portal + Owl components + JSON controllers)**.
- The portal is **authenticated**, meaning users must log in and only access their own reseller data.
- SEO is **not a concern** because the portal is not public-facing.
- The primary focus is:

  - Correct **data isolation per reseller**
  - Clean **Odoo-native integration**
  - Simple **deployment within a single addon**

- The system should demonstrate:

  - Backend security correctness
  - Proper use of Odoo ORM and controllers
  - Basic but functional frontend using Owl

Important architectural decision:

- Do NOT build a separate React/Vue frontend.
- Use Owl because it integrates directly with Odoo authentication, assets, and portal layout.

Time constraint:

- The full implementation is expected to be completed within **~3 days**, so prioritize correctness and simplicity over feature richness.

---

## 1. Objective

## 1. Objective

Implement a **Partner Reseller Portal** on **Odoo 19 Community Edition** using **Odoo Portal + Owl components (Option A)**.

The system must allow reseller users to:

- View their own data only (Opportunities, Quotations, Sales Orders, Invoices, Customers)
- Create new opportunities
- Delete their own opportunities

The most critical requirement is:

> Enforce strict data isolation per reseller at the backend level.

---

## 2. Core Principle (MUST FOLLOW)

### Security Rule

- NEVER trust any `reseller_id` from frontend payload.
- ALWAYS resolve reseller from:

  ```python
  request.env.user.partner_id
  ```

- When using `sudo()`, ALWAYS apply reseller domain filter BEFORE any operation.

### Correct Pattern

```python
reseller = request.env.user.partner_id
records = model.sudo().search([
    ("reseller_partner_id", "=", reseller.id)
])
```

### Forbidden Pattern

```python
reseller_id = payload.get("reseller_id")
model.sudo().search([])
model.sudo().browse(id).unlink()
```

---

## 3. High-Level Architecture

### Flow

```
Portal User Login
    ↓
Open /my/reseller-portal
    ↓
Portal Page Rendered (QWeb)
    ↓
Owl Component Mounted
    ↓
Frontend calls JSON APIs
    ↓
Backend resolves reseller from session
    ↓
Backend filters data by reseller
```

---

## 4. Module Structure

Create module:

```
nakivo_reseller_portal/
```

Required structure:

```
models/
controllers/
views/
security/
static/src/partner_portal/
docs/
```

---

## 5. Data Model Requirements

Add field to ALL relevant models:

```
reseller_partner_id = fields.Many2one("res.partner")
```

Apply to:

- crm.lead
- sale.order
- account.move
- res.partner (customers)

Ensure indexing for performance.

---

## 6. Backend Implementation Plan

### Step 1 – Base Setup

- Create module
- Add dependencies:

  - portal
  - crm
  - sale_management
  - account

---

### Step 2 – Models

- Add `reseller_partner_id`
- Ensure it is set on create for opportunities

---

### Step 3 – Portal Route

```
/my/reseller-portal
```

- type: http
- auth: user
- render portal template

---

### Step 4 – JSON APIs

Implement:

#### Dashboard API

```
POST /partner-portal/api/dashboard
```

Returns:

- opportunities
- quotations
- sales_orders
- invoices
- customers

All filtered by reseller.

---

#### Create Opportunity

```
POST /partner-portal/api/opportunities/create
```

- Validate input
- Assign reseller automatically

---

#### Delete Opportunity

```
POST /partner-portal/api/opportunities/<id>/delete
```

- Must verify ownership BEFORE delete

---

## 7. Frontend (Owl) Plan

### Step 1 – Root Component

Responsibilities:

- Load dashboard data
- Manage state
- Handle tab switching

State:

```
opportunities
quotations
sales_orders
invoices
customers
loading
error
activeTab
```

---

### Step 2 – UI Requirements

Tabs:

- Opportunities
- Quotations
- Sales Orders
- Invoices
- Customers

Must include:

- Loading state
- Error state
- Empty state

---

### Step 3 – Opportunity Features

- Create form
- Delete button
- Confirmation before delete

---

### Step 4 – Performance Constraints

- Limit records (<= 50)
- Avoid loading everything repeatedly
- Keep data in state

---

## 8. Performance Guidelines

- Do NOT fetch unnecessary fields
- Avoid N+1 queries
- Use indexed field `reseller_partner_id`
- Consider pagination (document if not implemented)

Frontend:

- Use single dashboard fetch OR lazy load per tab
- Avoid re-fetch on every tab switch

---

## 9. Security Checklist (MANDATORY)

Before finishing, verify:

- [ ] Reseller A cannot see Reseller B data
- [ ] Reseller A cannot delete Reseller B opportunity
- [ ] Create API auto assigns reseller
- [ ] No API trusts frontend reseller_id
- [ ] All sudo queries filtered

---

## 10. Testing Plan

Test scenarios:

1. Reseller A login → sees only A data
2. Reseller B login → sees only B data
3. Cross-delete attempt → fails
4. Create opportunity → correct reseller assigned

---

## 11. Documentation Tasks

Create docs:

### design.md

- Architecture
- Flow
- Assumptions

### api.md

- Endpoints
- Payloads

### security.md

- Data isolation logic
- Threat model

### ai-usage.md

- How AI was used

---

## 12. Constraints

- Time limit: 3 days
- Prioritize correctness over UI complexity
- Keep solution simple and clean

---

## 13. Definition of Done

The task is complete when:

- Portal page loads successfully
- Data is correctly scoped per reseller
- Create/delete works securely
- Basic UI works with states
- Documentation is complete

---

## 14. Notes for Agent

- Focus on backend correctness FIRST
- Do NOT over-engineer frontend
- Keep code readable
- Add comments where logic is security-sensitive

---

END OF PROMPT
