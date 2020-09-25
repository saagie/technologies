#syntax=docker/dockerfile-upstream:master-experimental

FROM docker.elastic.co/elasticsearch/elasticsearch:7.6.2

LABEL maintainer="Saagie"

ENV discovery.type single-node

# Nginx & Tini
RUN yum update -y
RUN yum install -y epel-release
RUN yum install -y nginx
RUN yum clean all

# CONF
COPY resources/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

# Beware, uses experimental feature frombuildkit with specific #syntax
COPY --chown=elasticsearch --chmod=744 resources/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]