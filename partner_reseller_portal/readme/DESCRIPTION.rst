Authenticated reseller portal built on Odoo 19 Community Edition.

Provides:

* a portal page at ``/my/reseller-portal``
* a reseller-scoped dashboard exposing opportunities, quotations, sales orders,
  invoices, and customers
* authenticated JSON endpoints to read, create, and delete reseller-owned
  opportunities
* backend-enforced data isolation per reseller through ACLs, record rules,
  and controller-level ownership checks
