{
    "name": "Partner Reseller Portal",
    "summary": "Authenticated reseller portal with reseller-scoped dashboard APIs.",
    "version": "19.0.1.0.0",
    "category": "Sales/CRM",
    "license": "LGPL-3",
    "depends": ["base_rest_api", "portal", "web", "crm", "sale_management", "account"],
    "data": [
        "security/partner_reseller_portal_groups.xml",
        "security/ir.model.access.csv",
        "security/partner_reseller_portal_security.xml",
        "views/partner_reseller_portal_templates.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            "partner_reseller_portal/static/src/partner_portal/partner_portal.js",
            "partner_reseller_portal/static/src/partner_portal/partner_portal.xml",
            "partner_reseller_portal/static/src/partner_portal/partner_portal.scss",
        ],
    },
    "external_dependencies": {
        "python": ["pydantic"],
    },
    "installable": True,
    "application": True,
}
