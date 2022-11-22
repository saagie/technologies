ARG METABASE_VERSION

FROM metabase/metabase:v$METABASE_VERSION

USER root

# Installing Nginx
RUN apk update \
    && apk add nginx \
    && rm /etc/nginx/http.d/default.conf \
    && mkdir -p /run/nginx

COPY server.conf /etc/nginx/http.d/metabase.conf

# Installing Drivers
RUN mkdir /app/plugins && chmod 777 /app/plugins
COPY /assets/*.jar /app/plugins/
COPY /assets/log4j2.xml /metabase.db/log4j2.xml

ENV MB_DB_TYPE h2
ENV MB_DB_FILE /metabase-data
ENV MB_PLUGINS_DIR /app/plugins
ENV JAVA_OPTS "-Dlog4j.configurationFile=file:///metabase.db/log4j2.xml"
ENV MB_DB_CONNECTION_TIMEOUT_MS 30000

EXPOSE 80
ADD entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]