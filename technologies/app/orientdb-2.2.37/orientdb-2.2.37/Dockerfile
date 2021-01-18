############################################################
# Dockerfile to run an OrientDB (Graph) Container
############################################################

FROM openjdk:8-jre-slim

LABEL maintainer="Saagie"

ENV ORIENTDB_VERSION 2.2.37
ENV ORIENTDB_DOWNLOAD_MD5 cb80556ef3b0260d0ee5de88ea73fb9d
ENV ORIENTDB_DOWNLOAD_SHA1 469c402dde029f265fe905de2c08b43960e81f07

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

ENV PATH /orientdb/bin:$PATH

VOLUME ["/orientdb/databases"]

WORKDIR /orientdb

#OrientDb binary
EXPOSE 9424
#OrientDb http
EXPOSE 9480

ENTRYPOINT ["/usr/local/bin/dockerd-entrypoint.sh"]
# Default command start the server
#CMD ["server.sh"]