FROM grafana/grafana:9.2.3-ubuntu

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

COPY server.conf /etc/nginx/sites-enabled/grafana.conf
COPY grafana.ini /etc/grafana/grafana.ini

ENV GF_PATHS_DATA /opt/grafana
ENV GF_PATHS_PLUGINS /opt/plugins

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
