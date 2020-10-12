FROM docker/compose:debian-1.27.4

RUN apt-get update -qq && apt-get install -yqq --no-install-recommends nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/ \
  && rm /etc/nginx/sites-enabled/default

WORKDIR /root

COPY entrypoint .
COPY docker-compose.yml .
COPY nginx.conf /etc/nginx/sites-enabled/toucan.conf

#RUN chmod 755 entrypoint
ENTRYPOINT [ "/root/entrypoint" ]
