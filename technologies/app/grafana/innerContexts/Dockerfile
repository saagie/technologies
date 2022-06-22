ARG grafana_base_img

FROM ${grafana_base_img}

USER root

RUN apt-get update \
  && apt-get install -y nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/ \
  && rm /etc/nginx/sites-enabled/default

RUN mkdir /opt/grafana && \
    mkdir /opt/plugins && \
    chown grafana /opt/grafana && \
    chown grafana /opt/plugins

COPY assets/server.conf /etc/nginx/sites-enabled/grafana.conf
COPY assets/grafana.ini /etc/grafana/grafana.ini

ENV GF_PATHS_DATA /opt/grafana
ENV GF_PATHS_PLUGINS /opt/plugins

ADD assets/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]