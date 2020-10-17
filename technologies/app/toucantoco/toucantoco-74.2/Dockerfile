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
COPY --from=FRONT /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/front.conf
COPY --from=FRONT /usr/local/bin/frontend-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
COPY resources/entrypoint.sh /usr/local/bin/saagie-entrypoint.sh

#RUN chmod +x /usr/local/bin/frontend-entrypoint.sh /usr/local/bin/saagie-entrypoint.sh
RUN sed -i '12i  include /etc/nginx/conf.d/*.conf;' /etc/nginx/nginx.conf \
    && sed -i '1d' /app/scripts/entrypoint.sh \
    && sed -i '1d' /usr/local/bin/frontend-entrypoint.sh \
    && cat /usr/local/bin/frontend-entrypoint.sh >> /usr/local/bin/saagie-entrypoint.sh \
    && cat /app/scripts/entrypoint.sh >> /usr/local/bin/saagie-entrypoint.sh

RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        watch && \
    rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["bash", "saagie-entrypoint.sh", "/usr/share/nginx/html/scripts/tc-params.js"]
EXPOSE 80 88 5000 8000 27017 6379


# expose port
# customize basepath

# RUN /bin/sh -c set -x
  #    && addgroup -g 101 -S nginx
  #    && adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx \
  #    && apkArch="$(cat /etc/apk/arch)" \
  #    && nginxPackages=" \
  #               nginx=${NGINX_VERSION}-r${PKG_RELEASE} \
  #               nginx-module-xslt=${NGINX_VERSION}-r${PKG_RELEASE} \
  #               nginx-module-geoip=${NGINX_VERSION}-r${PKG_RELEASE} \
  #               nginx-module-image-filter=${NGINX_VERSION}-r${PKG_RELEASE} \
  #               nginx-module-njs=${NGINX_VERSION}.${NJS_VERSION}-r${PKG_RELEASE}" \
  #    && case "$apkArch" in         x86_64)             set -x         \
  #    && KEY_SHA512="e7fa8303923d9b95db37a77ad46c68fd4755ff935d0a534d26eba83de193c76166c68bfe7f65471bf8881004ef4aa6df3e34689c305662750c0172fca5d8552a *stdin" \
  #    && apk add --no-cache --virtual .cert-deps openssl \
  #    && wget -O /tmp/nginx_signing.rsa.pub https://nginx.org/keys/nginx_signing.rsa.pub \
  #    && if [ "$(openssl rsa -pubin -in /tmp/nginx_signing.rsa.pub -text -noout | openssl sha512 -r)" = "$KEY_SHA512" ]; then \
  #        echo "key verification succeeded!"; \
  #        mv /tmp/nginx_signing.rsa.pub /etc/apk/keys/; \
  #       else \
  #        echo "key verification failed!"; \
  #        exit 1;
  #       fi
  #    && apk del .cert-deps         \
  #    && apk add -X "https://nginx.org/packages/alpine/v$(egrep -o '^[0-9]+\.[0-9]+' /etc/alpine-release)/main" --no-cache $nginxPackages             ;;         *)             set -x         \
  #    && tempDir="$(mktemp -d)"         \
  #    && chown nobody:nobody $tempDir         \
  #    && apk add --no-cache --virtual .build-deps                 gcc                 libc-dev                 make                 openssl-dev                 pcre-dev                 zlib-dev                 linux-headers                 libxslt-dev                 gd-dev                 geoip-dev                 perl-dev                 libedit-dev                 mercurial                 bash                 alpine-sdk                 findutils         \
  #    && su nobody -s /bin/sh -c " \
  #        export HOME=${tempDir} \
  #        && cd ${tempDir} \
  #        && hg clone https://hg.nginx.org/pkg-oss \
  #        && cd pkg-oss \
  #        && hg up -r 450 \
  #        && cd alpine \
  #        && make all \
  #        && apk index -o ${tempDir}/packages/alpine/${apkArch}/APKINDEX.tar.gz ${tempDir}/packages/alpine/${apkArch}/*.apk \
  #        && abuild-sign -k ${tempDir}/.abuild/abuild-key.rsa ${tempDir}/packages/alpine/${apkArch}/APKINDEX.tar.gz " \
  #    && cp ${tempDir}/.abuild/abuild-key.rsa.pub /etc/apk/keys/ \
  #    && apk del .build-deps \
  #    && apk add -X ${tempDir}/packages/alpine/ --no-cache $nginxPackages;; esac \
  #    && if [ -n "$tempDir" ]; then rm -rf "$tempDir"; fi \
  #    && if [ -n "/etc/apk/keys/abuild-key.rsa.pub" ]; then rm -f /etc/apk/keys/abuild-key.rsa.pub; fi \
  #    && if [ -n "/etc/apk/keys/nginx_signing.rsa.pub" ]; then rm -f /etc/apk/keys/nginx_signing.rsa.pub; fi \
  #    && apk add --no-cache --virtual .gettext gettext \
  #    && mv /usr/bin/envsubst /tmp/ \
  #    && runDeps="$( scanelf --needed --nobanner /tmp/envsubst | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' | sort -u | xargs -r apk info --installed | sort -u )" \
  #    && apk add --no-cache $runDeps \
  #    && apk del .gettext \
  #    && mv /tmp/envsubst /usr/local/bin/ \
  #    && apk add --no-cache tzdata \
  #    && ln -sf /dev/stdout /var/log/nginx/access.log \
  #    && ln -sf /dev/stderr /var/log/nginx/error.log