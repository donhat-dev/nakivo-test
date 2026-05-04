# Docker development environment

Self-contained Odoo 19 + Postgres 16 stack for the `nakivo-test` repository.

All Docker artifacts live in this folder so the repo root stays focused on
addons and tooling.

## Quick start

```bash
cd docker
cp .env.example .env  # optional, defaults are fine for local work
docker compose up -d
```

Odoo will be available on http://localhost:8069 once the containers are
healthy. Compose builds the local `Dockerfile`, installs `requirements.txt`,
configures logrotate, and bind-mounts the two repository addons read-only into
`/mnt/extra-addons` inside the container:

- `nakivo_base_rest/`
- `nakivo_reseller_portal/`

## Common commands

Install both addons in a fresh database called `nakivo`:

```bash
docker compose run --rm odoo odoo \
    --config=/etc/odoo/odoo.conf \
    -d nakivo_crm \
    -i nakivo_base_rest,nakivo_reseller_portal \
    --stop-after-init
```

Run the addon test suite:

```bash
docker compose run --rm odoo odoo \
    --config=/etc/odoo/odoo.conf \
    -d nakivo_crm_test \
    -i nakivo_reseller_portal \
    --test-enable \
    --stop-after-init
```

Start Odoo with `debugpy` for VS Code attach debugging:

```bash
docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d --build odoo
```

Then use the VS Code launch target `Odoo: Attach (Docker)`. Port `5678` is
published only when the debug overlay is active.

Open a shell inside the running Odoo container:

```bash
docker compose exec odoo bash
```

Tail Odoo logs:

```bash
docker compose logs -f odoo
```

Tail the Odoo server logfile:

```bash
tail -f logs/odoo-server.log
```

Reset everything (including the database volume):

```bash
docker compose down -v
```

## Notes

- The container picks up code changes on container restart because the addon
  folders are mounted as volumes.
- Set `ODOO_HTTP_PORT` in `.env` if 8069 is already in use on your host.
- Runtime Python packages such as `pydantic` are installed during image build
  from the repository-level `requirements.txt`.
- The Dockerfile defaults apt to `https://th.archive.ubuntu.com/ubuntu/`
  because the default Canonical mirrors may timeout from some Docker networks.
  Override with `docker compose build --build-arg APT_UBUNTU_MIRROR=<mirror>`.
