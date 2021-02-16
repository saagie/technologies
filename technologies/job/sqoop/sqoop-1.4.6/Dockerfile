ARG base_img

FROM ${base_img} AS BASE_IMG

LABEL maintainer="Saagie <yann.petit@saagie.com>"

ENV DEBIAN_FRONTEND noninteractive

ARG CDH_MAIN_VERSION=5
# TODO : should use the latest .16.2 version if available
ENV CDH_VERSION "${CDH_MAIN_VERSION}.13.0"
ENV CDH_URL "http://ovh.ypetit.net:18080"

ARG SQOOP_VERSION=1.4.6
ARG SQOOP_FILE="sqoop-${SQOOP_VERSION}-cdh${CDH_VERSION}"

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -sL "${CDH_URL}/${SQOOP_FILE}.tar.gz" | tar xzf - -C "/" \
    && cp ${HIVE_HOME}/lib/*.jar /${SQOOP_FILE}/lib/ \
    && mkdir -p /usr/lib/hive-hcatalog/share/hcatalog/ \
    && ln -s ${HIVE_HOME}/hcatalog/share/hcatalog/hive-hcatalog-core-${HIVE_VERSION}-cdh${CDH_VERSION}.jar $_/hive-hcatalog-core.jar
ENV SQOOP_HOME "/${SQOOP_FILE}"
ENV PATH "${PATH}:${SQOOP_HOME}/bin"

ENV HADOOP_HOME "${HADOOP_PREFIX}"

COPY lib/*.jar /${SQOOP_FILE}/lib/

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

ENTRYPOINT  ["bash","/entrypoint"]