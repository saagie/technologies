FROM saagie/spark:3.1-1.100.0 as builder

FROM alpine:3.15

WORKDIR /opt/
COPY --from=builder /opt/spark /opt/spark
USER root

ENV HADOOP_CONF_DIR=/etc/hadoop/conf

RUN apk update && \
    apk add nginx && \
    apk add --no-cache bash  && \
    apk --no-cache add openjdk11

ADD server.conf /etc/nginx/http.d/server.conf
RUN rm /etc/nginx/http.d/default.conf

ENV SPARK_NO_DAEMONIZE TRUE
EXPOSE 80

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
