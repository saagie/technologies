FROM saagie/toucantoco_base_backend

# Nginx
RUN apt-get update \
  && apt-get install -y nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/

COPY resources/server.conf /etc/nginx/sites-enabled/toucan_backend.conf
#RUN rm /etc/nginx/sites-enabled/default

EXPOSE 80
ADD resources/entrypoint.sh /entrypoint.sh
RUN chmod 755        /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]


