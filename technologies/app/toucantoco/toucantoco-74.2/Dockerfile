FROM toucantoco/frontend:v76.0.0 AS FRONT
FROM toucantoco/screenshot:1.1.10 AS SCREEN

FROM toucantoco/backend:v76.0.0

ENV DEBIAN_FRONTEND noninteractive

# Install redis & mongo
RUN apt-get update -qq && \
    apt-get --fix-broken install --assume-yes && \
# TODO - remove once dev finished
    apt-get install -yqq --no-install-recommends \
        nano htop net-tools && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        curl redis-server build-essential python3.7-dev libssl-dev libcurl4-openssl-dev liblzma-dev && \
    rm -rf /var/lib/apt/lists/*

# TODO create mongo user $MONGO_USER

RUN curl -s https://fastdl.mongodb.org/src/mongodb-src-r4.4.1.tar.gz | tar -xz -C /usr/local/ && \
    cd /usr/local/mongodb-src-r4.4.1 && \
    python3 -m pip install -r etc/pip/compile-requirements.txt && \
    python3 buildscripts/scons.py install-mongod --disable-warnings-as-errors && \
    mv /usr/local/mongodb-src-r4.4.1/build/install/bin/* /usr/bin/ && \
    rm -rf /usr/local/mongodb-src-r4.4.1 && \
    mkdir -p /var/lib/mongodb /var/log/mongod
# TODO sudo chown $MONGO_USER /var/lib/mongo
# TODO sudo chown $MONGO_USER /var/log/mongodb
# TODO check ulimit > 64000

COPY --from=FRONT /usr/share/nginx/html /usr/share/nginx/html
COPY resources/proxy.conf /etc/nginx/conf.d/proxy.conf
COPY --from=FRONT /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/front.conf
COPY --from=FRONT /usr/local/bin/frontend-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
COPY resources/entrypoint.sh /usr/local/bin/saagie-entrypoint.sh

#RUN chmod +x /usr/local/bin/frontend-entrypoint.sh /usr/local/bin/saagie-entrypoint.sh
RUN sed -i '12i  include /etc/nginx/conf.d/*.conf;' /etc/nginx/nginx.conf \
    && sed -i '1,2d' /app/scripts/entrypoint.sh \
    && sed -i '1d' /usr/local/bin/frontend-entrypoint.sh \
    && sed -i '$d' /usr/local/bin/frontend-entrypoint.sh \
    && cat /usr/local/bin/frontend-entrypoint.sh >> /usr/local/bin/saagie-entrypoint.sh \
    && cat /app/scripts/entrypoint.sh >> /usr/local/bin/saagie-entrypoint.sh

RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        watch && \
    rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["bash", "saagie-entrypoint.sh", "/usr/share/nginx/html/scripts/tc-params.js"]
EXPOSE 88 89 90 91 27017 6379
