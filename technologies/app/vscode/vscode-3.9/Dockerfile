FROM ghcr.io/linuxserver/code-server:version-v3.9.3

USER root

ENV PUID=1000
ENV PGID=1000
RUN TZ=Europe/London

RUN apt-get update \
    && apt-get install -y nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/ \
    && rm /etc/nginx/sites-enabled/default
 
COPY ressources/nginx.conf /etc/nginx/sites-enabled/nginx.conf
COPY ressources/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \   
    && chmod +x /etc/nginx/sites-enabled/nginx.conf

EXPOSE 8443

ENTRYPOINT ["/entrypoint.sh"]