FROM dbeaver/cloudbeaver:22.1.&

ENV DEBIAN_FRONTEND noninteractive

# Nginx
RUN apt-get update -qq \
  && apt-get install -yqq --no-install-recommends \
        nginx \
  && rm /etc/nginx/sites-enabled/default \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/

COPY resources/nginx.conf /etc/nginx/sites-enabled/cloudbeaver.conf
COPY resources/entrypoint.sh /entrypoint.sh
RUN chmod 644 /etc/nginx/sites-enabled/cloudbeaver.conf \
    && chmod 755 /entrypoint.sh


ENTRYPOINT ["/entrypoint.sh"]