# syntax=docker/dockerfile:1.7

# ─── Stage 1: build the React SPA ────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /workspace

# Copy only package files first for better layer caching.
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --prefer-offline

# Copy the rest of the frontend source and build.
# The vite.config.ts outDir is '../nakivo_reseller_portal/static/react',
# so we create that sibling directory before running the build.
COPY frontend/ ./frontend/
RUN mkdir -p nakivo_reseller_portal/static/react \
    && cd frontend && npm run build
# Output: /workspace/nakivo_reseller_portal/static/react/index.html

# ─── Stage 2: base Odoo image ─────────────────────────────────────────────────
FROM odoo:19 AS base

USER root

ARG APT_UBUNTU_MIRROR=https://th.archive.ubuntu.com/ubuntu/

RUN sed -i "s#http://archive.ubuntu.com/ubuntu/#${APT_UBUNTU_MIRROR}#g; s#http://security.ubuntu.com/ubuntu/#${APT_UBUNTU_MIRROR}#g" /etc/apt/sources.list.d/ubuntu.sources \
    && printf 'Acquire::ForceIPv4 "true";\nAcquire::http::Timeout "30";\nAcquire::https::Timeout "30";\n' > /etc/apt/apt.conf.d/99nakivo-network

RUN apt-get -o Acquire::Retries=5 update \
    && apt-get -o Acquire::Retries=5 install -y --no-install-recommends cron logrotate \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/requirements.txt
RUN if [ -s /tmp/requirements.txt ]; then \
        pip3 install --no-cache-dir --break-system-packages --ignore-installed -r /tmp/requirements.txt; \
    fi \
    && rm -f /tmp/requirements.txt

COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/logrotate /etc/odoo/logrotate

RUN chmod 755 /entrypoint.sh \
    && mkdir -p /var/log/odoo \
    && touch /var/log/odoo/odoo-server.log \
    && chown -R odoo:odoo /var/log/odoo /var/lib/odoo \
    && cp /etc/odoo/logrotate /etc/logrotate.d/odoo

ENTRYPOINT ["/entrypoint.sh"]
CMD ["odoo"]

# ─── Stage 3: production ──────────────────────────────────────────────────────
FROM base AS production

# Embed the built React SPA into the addon static directory.
# In docker-compose the addon dirs are volume-mounted, so local builds
# (npm run build from frontend/) are picked up without rebuilding the image.
# The COPY here is for CI/CD pipelines that build and ship the image directly.
COPY --from=frontend-build \
    /workspace/nakivo_reseller_portal/static/react/index.html \
    /mnt/extra-addons/nakivo_reseller_portal/static/react/index.html

# ─── Stage 4: debug ───────────────────────────────────────────────────────────
FROM base AS debug

RUN pip3 install --no-cache-dir --break-system-packages --ignore-installed debugpy
