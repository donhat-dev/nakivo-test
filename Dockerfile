# syntax=docker/dockerfile:1.7

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

FROM base AS production

FROM base AS debug

RUN pip3 install --no-cache-dir --break-system-packages --ignore-installed debugpy
