FROM saagie/toucantoco_frontend:v76.0.0 AS FRONT
FROM saagie/toucantoco_screenshot:1.1.10 AS SCREEN

FROM saagie/toucantoco_backend:v76.0.0

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -qq && \
    apt-get --fix-broken install --assume-yes && \
    rm -rf /var/lib/apt/lists/*
RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        curl redis-server build-essential python3.7-dev libssl-dev libcurl4-openssl-dev liblzma-dev && \
    rm -rf /var/lib/apt/lists/*
RUN curl -O https://repo.mongodb.org/apt/debian/dists/buster/mongodb-org/4.4/main/binary-amd64/mongodb-org-server_4.4.2_amd64.deb \
    && dpkg-deb --extract mongodb-org-server_4.4.2_amd64.deb / \
    && mkdir -p /var/lib/mongodb /var/log/mongod

COPY --from=FRONT /usr/share/nginx/html /usr/share/nginx/html
COPY resources/proxy.conf /etc/nginx/conf.d/proxy.conf
COPY --from=FRONT /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/front.conf
COPY --from=FRONT /usr/local/bin/frontend-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
COPY resources/entrypoint.sh /usr/local/bin/saagie-entrypoint.sh

RUN sed -i '12i  include /etc/nginx/conf.d/*.conf;' /etc/nginx/nginx.conf \
    && sed -i '1,2d' /app/scripts/entrypoint.sh \
    && sed -i '1d' /usr/local/bin/frontend-entrypoint.sh \
    && sed -i '$d' /usr/local/bin/frontend-entrypoint.sh \
    && cat /usr/local/bin/frontend-entrypoint.sh >> /usr/local/bin/saagie-entrypoint.sh \
    && cat /app/scripts/entrypoint.sh >> /usr/local/bin/saagie-entrypoint.sh

VOLUME  /data \
        /app/storage

ENTRYPOINT ["bash", "saagie-entrypoint.sh", "/usr/share/nginx/html/scripts/tc-params.js"]
EXPOSE 8080 8090 27017 6379
