FROM dbeaver/cloudbeaver:1.2.0

ENV DEBIAN_FRONTEND noninteractive

# Nginx
RUN apt-get update -qq \
  && apt-get install -yqq --no-install-recommends nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/

COPY resources/nginx.conf /etc/nginx/sites-enabled/cloudbeaver.conf
COPY resources/entrypoint.sh /entrypoint

ENTRYPOINT ["/entrypoint"]
