ARG base_img

FROM ${base_img} AS BASE_IMG

LABEL maintainer="Saagie <yann.petit@saagie.com>"

ENV DEBIAN_FRONTEND noninteractive

ENV SQOOP_VERSION=1.4.6
ARG SQOOP_FILE="sqoop-${SQOOP_VERSION}.bin__hadoop-2.0.4-alpha"
ARG SQOOP_URL="${APACHE_URL}/sqoop/${SQOOP_VERSION}"
ENV SQOOP_HOME="/usr/lib/sqoop-${SQOOP_VERSION}"

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
# Install Sqoop, ass hive libs and remove old/conflicting libs
RUN curl -sL "${SQOOP_URL}/${SQOOP_FILE}.tar.gz" | tar xzf - -C "/" \
    && mv "/${SQOOP_FILE}" "${SQOOP_HOME}" \
    && cp ${HIVE_HOME}/lib/*.jar ${SQOOP_HOME}/lib/ \
    && rm ${SQOOP_HOME}/lib/commons-io-1.4.jar \
    && rm ${SQOOP_HOME}/lib/commons-logging-1.1.1.jar \
    && mkdir -p /usr/lib/hive-hcatalog/share/hcatalog/ \
    && ln -s ${HIVE_HOME}/hcatalog/share/hcatalog/hive-hcatalog-core-${HIVE_VERSION}.jar $_/hive-hcatalog-core.jar

ENV PATH "${PATH}:${SQOOP_HOME}/bin"

ENV HADOOP_HOME "${HADOOP_PREFIX}"
COPY lib/*.jar /${SQOOP_HOME}/lib/

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

ENTRYPOINT  ["bash","/entrypoint"]