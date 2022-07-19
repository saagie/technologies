FROM dpage/pgadmin4:6.10

USER root

#Nginx
RUN apk update \
  && apk add nginx

RUN rm /etc/nginx/http.d/default.conf
COPY server.conf /etc/nginx/http.d/pgadmin.conf

#Entrypoint
ADD entrypoint_saagie.sh /
RUN chmod 777 /entrypoint_saagie.sh

#PGadmin conf
ENV PGADMIN_LISTEN_PORT=92
EXPOSE 80 92
RUN mkdir /var/log/gunicorn/
ENV GUNICORN_ACCESS_LOGFILE="/var/log/gunicorn/gunicorn.log"

ENTRYPOINT ["/entrypoint_saagie.sh"]
