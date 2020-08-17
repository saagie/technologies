FROM apache/nifi:1.9.2

USER root
# Nginx
RUN apt-get update -qq \
  && DEBIAN_FRONTEND=noninteractive apt-get install -qqy --no-install-recommends \
      nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && rm /etc/nginx/sites-enabled/default \
  && rm /var/www/html/index.nginx-debian.html \
  && ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

# Web HTTP(s) & Socket Site-to-Site Ports
EXPOSE 80 8080 8443 10000 8000

COPY resources/nginx.conf /etc/nginx/sites-enabled/nginx.conf
COPY resources/start.sh /opt/nifi/scripts/start.sh

COPY entrypoint /entrypoint

RUN chmod +x /opt/nifi/scripts/start.sh && chmod 755 /entrypoint && cp -rfv /opt/nifi/nifi-current/conf /opt/nifi/nifi-current/conf-tmp

ENTRYPOINT [ "/entrypoint" ]