FROM debian:stretch-20210111

LABEL maintainer="Saagie <yann.petit@saagie.com>"

ENV DEBIAN_FRONTEND noninteractive

ARG CDH_MAIN_VERSION=5
# TODO : should use the latest .16.2 version if available
ENV CDH_VERSION "${CDH_MAIN_VERSION}.13.0"
ENV CDH_URL "http://ovh.ypetit.net:18080"

ARG HADOOP_VERSION=2.6.0
ENV HIVE_VERSION 1.1.0
ARG HADOOP_FILE="hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION}"
ARG HIVE_FILE="hive-${HIVE_VERSION}-cdh${CDH_VERSION}"

ENV HADOOP_PREFIX "/usr/lib/hadoop"

# LIGHT DEPENDENCIES START
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client git procps krb5-user && \
    rm -rf /var/lib/apt/lists/*
# LIGHT DEPENDENCIES END

# INSTALL JAVA & BEELINE START
# INSTALL JDK8
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=${PATH}:${JAVA_HOME}/bin

# Hadoop client installation
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -sL "${CDH_URL}/${HADOOP_FILE}.tar.gz" | tar xzf - -C "/" \
    && ln -s "/${HADOOP_FILE}" "${HADOOP_PREFIX}"
ENV PATH "${PATH}:${HADOOP_PREFIX}/bin"
ENV HADOOP_COMMON_HOME "${HADOOP_PREFIX}"
ENV HADOOP_CONF_DIR "/etc/hadoop/conf"

# Hive client installation
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -sL "${CDH_URL}/${HIVE_FILE}.tar.gz" | tar xzf - -C "/"
ENV HIVE_HOME "/${HIVE_FILE}"
ENV PATH "${PATH}:${HIVE_HOME}/bin"
ENV HIVE_CONF_DIR "/etc/hive/conf"
# INSTALL JAVA & BEELINE END

ENV LD_LIBRARY_PATH "${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
