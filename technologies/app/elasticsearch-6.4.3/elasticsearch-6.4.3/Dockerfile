FROM docker.elastic.co/elasticsearch/elasticsearch:6.4.3

LABEL maintainer="Saagie"

# Nginx
RUN yum install -y epel-release && \
    yum install -y nginx && \
    yum clean all

# CONF
COPY resources/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8200
EXPOSE 8300

COPY --chown=elasticsearch resources/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV discovery.type single-node

ENTRYPOINT ["/entrypoint.sh"]