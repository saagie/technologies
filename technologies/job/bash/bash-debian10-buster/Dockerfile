FROM debian:buster-20221205
ENV DEBIAN_FRONTEND noninteractive

ENV APACHE_URL "https://archive.apache.org/dist"

ENV HADOOP_VERSION=2.6.0
ARG HADOOP_FILE="hadoop-${HADOOP_VERSION}"
ENV HADOOP_URL "${APACHE_URL}/hadoop/common/${HADOOP_FILE}"
ENV HADOOP_PREFIX "/usr/lib/hadoop"

ENV HIVE_VERSION 1.1.0
ARG HIVE_FILE="apache-hive-${HIVE_VERSION}-bin"
ENV HIVE_URL "${APACHE_URL}/hive/hive-${HIVE_VERSION}"

# LIGHT DEPENDENCIES START
RUN apt update -qq && apt install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client git procps krb5-user && \
    rm -rf /var/lib/apt/lists/*
# LIGHT DEPENDENCIES END

# INSTALL JAVA & BEELINE START
# INSTALL JDK8
RUN apt-get update -qq && \
    apt-get -y install software-properties-common && \
    apt-add-repository 'deb http://security.debian.org/debian-security stretch/updates main' && \
    apt-get update && \
    apt-get install -yqq --no-install-recommends openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=${PATH}:${JAVA_HOME}/bin

# Hadoop client installation
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -sL "${HADOOP_URL}/${HADOOP_FILE}.tar.gz" | tar xzf - -C "/" \
    && ln -s "/${HADOOP_FILE}" "${HADOOP_PREFIX}"
ENV PATH "${PATH}:${HADOOP_PREFIX}/bin"
ENV HADOOP_COMMON_HOME "${HADOOP_PREFIX}"
ENV HADOOP_CONF_DIR "/etc/hadoop/conf"

# Hive client installation
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -sL "${HIVE_URL}/${HIVE_FILE}.tar.gz" | tar xzf - -C "/"
ENV HIVE_HOME "/${HIVE_FILE}"
ENV PATH "${PATH}:${HIVE_HOME}/bin"
ENV HIVE_CONF_DIR "/etc/hive/conf"
# INSTALL JAVA & BEELINE END

# From https://cwiki.apache.org/confluence/display/Hive/Hive+on+Spark%3A+Getting+Started
# Solves JLine version incompatibility between Hadoop and Hive
ENV HADOOP_USER_CLASSPATH_FIRST "true"

ENV LD_LIBRARY_PATH "${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]