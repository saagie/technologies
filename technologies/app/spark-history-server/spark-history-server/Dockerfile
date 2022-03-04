FROM saagie/spark:3.1-1.100.0 as builder

FROM alpine:3.10

WORKDIR /opt/
COPY --from=builder /opt/spark /opt/spark
USER root

RUN apk update && \
    apk add nginx && \
    apk add --no-cache bash  && \
    apk --no-cache add openjdk11

ADD server.conf /etc/nginx/conf.d/server.conf
RUN rm /etc/nginx/conf.d/default.conf && \
    mkdir /run/nginx

ENV SPARK_NO_DAEMONIZE TRUE
EXPOSE 80

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
