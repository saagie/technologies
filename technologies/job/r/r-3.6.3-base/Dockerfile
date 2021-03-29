FROM rocker/r-apt:bionic

LABEL maintainer="Saagie <yann.petit@saagie.com>"

USER root

ENV DEBIAN_FRONTEND noninteractive

ARG APACHE_URL="https://archive.apache.org/dist"

# Install system libraries required by R packages
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
      libcups2 libcups2-dev openjdk-11-jdk systemd \
      unixodbc-dev libbz2-dev libgsl-dev odbcinst libx11-dev mesa-common-dev libglu1-mesa-dev \
      gdal-bin proj-bin libgdal-dev libproj-dev libudunits2-dev libtcl8.6 libtk8.6 libgtk2.0-dev \
      krb5-user \
      curl \
      libgit2-dev \
    && apt-get clean \
    && rm -rf /var/cache/* \
    && rm -rf /tmp/* \
    && rm -rf /var/log/* \
    && rm -rf /var/lib/apt/lists/*

# INSTALL JDK8
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=${PATH}:${JAVA_HOME}/bin

# Hadoop client installation
ARG HADOOP_VERSION="2.6.0"
ARG HADOOP_FILE="hadoop-${HADOOP_VERSION}"
ARG HADOOP_URL="${APACHE_URL}/hadoop/common/${HADOOP_FILE}"
ENV HADOOP_HOME "/usr/local/hadoop"
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -sL "${HADOOP_URL}/${HADOOP_FILE}.tar.gz" | tar xzf - -C "/" \
    && ln -s "/${HADOOP_FILE}" "${HADOOP_HOME}"
ENV PATH "${PATH}:${HADOOP_HOME}/bin"
ENV HADOOP_CONF_DIR "/etc/hadoop/conf"

# Hive client installation
ARG HIVE_VERSION="1.2.2"
ARG HIVE_FILE="apache-hive-${HIVE_VERSION}-bin"
ARG HIVE_URL="${APACHE_URL}/hive/hive-${HIVE_VERSION}"
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -sL "${HIVE_URL}/${HIVE_FILE}.tar.gz" | tar xzf - -C "/"
ENV HIVE_HOME "/${HIVE_FILE}"
ENV PATH "${PATH}:${HIVE_HOME}/bin"
ENV HIVE_CONF_DIR "/etc/hive/conf"

# Install Hive ODBC driver
ARG HIVE_ODBC_VERSION="2.6.4.1004"
ARG HIVE_ODBC_FILE="clouderahiveodbc_${HIVE_ODBC_VERSION}-2_amd64.deb"
ARG HIVE_ODBC_URL="https://downloads.cloudera.com/connectors/ClouderaHive_ODBC_${HIVE_ODBC_VERSION}/Debian/${HIVE_ODBC_FILE}"
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      libsasl2-modules-gssapi-mit \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && cd /tmp \
    && wget --no-verbose "${HIVE_ODBC_URL}" \
    && dpkg -i "${HIVE_ODBC_FILE}" \
    && odbcinst -i -d -f /opt/cloudera/hiveodbc/Setup/odbcinst.ini \
    && rm "/tmp/${HIVE_ODBC_FILE}" \
    && rm -rf /var/log/* \
    && rm -rf /var/cache/*

# Install Impala ODBC dependency
ARG IMPALA_ODBC_VERSION="2.6.8.1008"
ARG IMPALA_ODBC_FILE="clouderaimpalaodbc_${IMPALA_ODBC_VERSION}-2_amd64.deb"
ARG IMPALA_ODBC_URL="https://downloads.cloudera.com/connectors/ClouderaImpala_ODBC_${IMPALA_ODBC_VERSION}/Debian/${IMPALA_ODBC_FILE}"
RUN cd /tmp \
    && wget --no-verbose "${IMPALA_ODBC_URL}" \
    && dpkg -i "${IMPALA_ODBC_FILE}" \
    && odbcinst -i -d -f /opt/cloudera/impalaodbc/Setup/odbcinst.ini \
    && rm "/tmp/${IMPALA_ODBC_FILE}" \
    && rm -rf /var/log/* \
    && sed -i 's/DriverManagerEncoding=UTF-32/DriverManagerEncoding=UTF-16/g' /opt/cloudera/impalaodbc/lib/64/cloudera.impalaodbc.ini

RUN mkdir /root/.R/ \
    && echo CXXFLAGS=-DBOOST_PHOENIX_NO_VARIADIC_EXPRESSION > /root/.R/Makevars \
    && R CMD javareconf

# Install Saagie's RStudio Addin
RUN R -e "install.packages(c('Rcpp','RTools','devtools'))" \
    && R -e "devtools::install_github('saagie/rstudio-saagie-addin')"

ENV HADOOP_CONF_DIR=/etc/hadoop/conf
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

CMD ["/bin/sh", "-c", "/entrypoint"]
