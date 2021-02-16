FROM saagie/bash:debian9-stretch-1.80.0

LABEL maintainer="Saagie <yann.petit@saagie.com>"

ENV DEBIAN_FRONTEND noninteractive

ARG CDH_MAIN_VERSION=5
# TODO : should use the latest .16.2 version if available
ENV CDH_VERSION ${CDH_MAIN_VERSION}.13.0
ENV CDH_URL http://ovh.ypetit.net:18080

ARG SQOOP_VERSION=1.4.6
ARG SQOOP_FILE="sqoop-${SQOOP_VERSION}-cdh${CDH_VERSION}"

RUN wget --no-verbose ${CDH_URL}/${SQOOP_FILE}.tar.gz \
    && tar -xvzf ${SQOOP_FILE}.tar.gz \
    && rm ${SQOOP_FILE}.tar.gz \
    && mkdir -p /${SQOOP_FILE}/lib/ \
    && cp ${HIVE_HOME}/lib/*.jar /${SQOOP_FILE}/lib/
ENV SQOOP_HOME=/${SQOOP_FILE}
ENV PATH=${PATH}:${SQOOP_HOME}/bin

ENV HADOOP_HOME=${HADOOP_PREFIX}

COPY lib/*.jar /${SQOOP_FILE}/lib/
