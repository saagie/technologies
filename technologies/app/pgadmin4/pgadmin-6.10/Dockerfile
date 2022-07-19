FROM dpage/pgadmin4:6.10

USER root

#Nginx
RUN apk update \
  && apk add nginx \
  && rm -rf /var/cache/apk/*

RUN rm /etc/nginx/http.d/default.conf
COPY server.conf /etc/nginx/http.d/pgadmin.conf

#Entrypoint
COPY entrypoint_saagie.sh /

#PGadmin conf
ENV PGADMIN_LISTEN_PORT=92
EXPOSE 80 92
RUN mkdir /var/log/gunicorn/
ENV GUNICORN_ACCESS_LOGFILE="/var/log/gunicorn/gunicorn.log"

ENTRYPOINT ["/entrypoint_saagie.sh"]
