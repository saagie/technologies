FROM debian:stretch-20210111

LABEL maintainer="Saagie <yann.petit@saagie.com>"

ENV DEBIAN_FRONTEND noninteractive

ENV CDH_MAIN_VERSION 5
ENV CDH_VERSION ${CDH_MAIN_VERSION}.13.3
ENV HADOOP_VERSION 2.6.0
ENV HIVE_VERSION 1.1.0

# LIGHT DEPENDENCIES START
RUN apt update -qq && apt install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client git procps krb5-user && \
    rm -rf /var/lib/apt/lists/*
# LIGHT DEPENDENCIES END

# INSTALL JAVA & BEELINE START
# INSTALL JDK8
RUN apt update -qq && apt install -yqq --no-install-recommends \
      openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# Hadoop client installation
RUN wget --no-verbose http://archive.cloudera.com/cdh${CDH_MAIN_VERSION}/cdh/${CDH_MAIN_VERSION}/hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION}.tar.gz \
        && tar -xzf hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION}.tar.gz \
        && rm hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION}.tar.gz \
        && mv hadoop--cdh${CDH_VERSION} ${HADOOP_PREFIX}
ENV HADOOP_PREFIX=/usr/lib/hadoop
ENV PATH=$PATH:$HADOOP_PREFIX/bin
ENV HADOOP_COMMON_HOME=$HADOOP_PREFIX
ENV HADOOP_CONF_DIR=/etc/hadoop/conf

# Hive client installation
RUN wget --no-verbose http://archive.cloudera.com/cdh${CDH_MAIN_VERSION}/cdh/${CDH_MAIN_VERSION}/hive-${HIVE_VERSION}-cdh${CDH_VERSION}.tar.gz \
    && tar -xzf hadoop-${HIVE_VERSION}-cdh${CDH_VERSION}.tar.gz \
    && rm hadoop-${HIVE_VERSION}-cdh${CDH_VERSION}.tar.gz
ENV HIVE_HOME=/hive-${HIVE_VERSION}-cdh${CDH_VERSION}
ENV PATH=$PATH:$HIVE_HOME/bin
# INSTALL JAVA & BEELINE END

ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
