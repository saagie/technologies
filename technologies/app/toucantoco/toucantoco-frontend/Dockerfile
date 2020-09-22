FROM ubuntu

RUN apt-get update \
  && apt-get install -y nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/

ADD resources/vhost_nginx.conf /etc/nginx/sites-enabled/toucan.conf
ADD resources/www/ /usr/share/nginx/html
RUN rm /etc/nginx/sites-enabled/default

EXPOSE 80
ADD resources/entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
