def post_init_hook(env):
    """Create the demo reseller user if demo data was loaded.

    Runs after module install. Only proceeds if the demo partner was created,
    which happens only when the database is initialized with demo data.
    Using _change_password() avoids plain-text storage in XML records.
    """
    partner = env.ref(
        "nakivo_reseller_portal.demo_reseller_partner",
        raise_if_not_found=False,
    )
    if not partner:
        return

    reseller_group = env.ref("nakivo_reseller_portal.group_reseller_portal_user")

    user = (
        env["res.users"]
        .with_context(no_reset_password=True)
        .create(
            {
                "name": "NAKIVO Demo Reseller",
                "login": "reseller@demo.com",
                "partner_id": partner.id,
                "group_ids": [(6, 0, [reseller_group.id])],
            }
        )
    )
    user._change_password("demo1234")
