############################################################
# Dockerfile to run an OrientDB (Graph) Container
############################################################

FROM eclipse-temurin:8-jre-jammy

LABEL maintainer="Saagie"

ENV LANG C.UTF-8
ENV ORIENTDB_VERSION 3.1.7
ENV ORIENTDB_DOWNLOAD_MD5 0fc8324fc463488ff5cc43ad7fad76c7
ENV ORIENTDB_DOWNLOAD_SHA1 aeaec1cfba7c3a9eb7d8959aa23a568305c3be14

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl wget nginx \
    && rm -rf /var/lib/apt/lists/*

#download distribution tar, untar and delete databases
RUN mkdir /orientdb \
  && wget  "https://repo1.maven.org/maven2/com/orientechnologies/orientdb-community/$ORIENTDB_VERSION/orientdb-community-$ORIENTDB_VERSION.tar.gz" \
  && echo "$ORIENTDB_DOWNLOAD_MD5 *orientdb-community-$ORIENTDB_VERSION.tar.gz" | md5sum -c - \
  && echo "$ORIENTDB_DOWNLOAD_SHA1 *orientdb-community-$ORIENTDB_VERSION.tar.gz" | sha1sum -c - \
  && tar -xvzf orientdb-community-$ORIENTDB_VERSION.tar.gz -C /orientdb --strip-components=1\
  && rm orientdb-community-$ORIENTDB_VERSION.tar.gz \
  && rm -rf /orientdb/databases/*

## Configure entrypoint, change owner of created files to model-server
COPY resources/dockerd-entrypoint.sh /usr/local/bin/dockerd-entrypoint.sh
RUN chmod +x /usr/local/bin/dockerd-entrypoint.sh

# Modify conf nginx
RUN useradd -m nginx
COPY resources/nginx.conf /etc/nginx/nginx.conf
COPY resources/index.htm /orientdb/www/index.htm

ENV PATH /orientdb/bin:$PATH

VOLUME ["/orientdb/databases"]

WORKDIR /orientdb

#OrientDb binary
EXPOSE 9424
#OrientDb http
EXPOSE 9480

ENTRYPOINT ["/usr/local/bin/dockerd-entrypoint.sh"]
