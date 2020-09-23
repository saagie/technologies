FROM docker.elastic.co/elasticsearch/elasticsearch:7.6.2

MAINTAINER Saagie

ENV DEBIAN_FRONTEND noninteractive

ENV discovery.type single-node

# Nginx
RUN apt-get update -qq \
  && apt-get install -yqq --no-install-recommends nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY resources/server.conf /etc/nginx/sites-enabled/elasticsearch.conf
RUN rm /etc/nginx/sites-enabled/default

EXPOSE 80
ADD resources/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/tini", "--", "/entrypoint.sh"]