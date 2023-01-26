FROM rocker/tidyverse:4.2.2

LABEL maintainer="Saagie <tony@saagie.com>"

USER root

ENV DEBIAN_FRONTEND noninteractive

ENV CDH_MAIN_VERSION 5
ENV CDH_VERSION ${CDH_MAIN_VERSION}.13.0
ENV HADOOP_VERSION 2.7.0
ENV HIVE_VERSION 1.2.2
ENV HIVE_ODBC_VERSION 2.6.4.1004
ENV HIVE_ODBC_VERSION_FULL ${HIVE_ODBC_VERSION}-2_amd64
ENV IMPALA_ODBC_VERSION 2.5.41.1029
ENV IMPALA_ODBC_VERSION_FULL ${IMPALA_ODBC_VERSION}-2_amd64

# Store Root envvar to be able to exclude it at runtime when propagating envvars to every user
RUN env >> /ROOT_ENV_VAR && chmod 400 /ROOT_ENV_VAR

# Install system libraries required
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        krb5-user \
        openjdk-11-jdk \
        unixodbc-dev \
        odbcinst \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Hive client installation
RUN wget --no-verbose http://apache.mirrors.ovh.net/ftp.apache.org/dist/hive/hive-${HIVE_VERSION}/apache-hive-${HIVE_VERSION}-bin.tar.gz \
    && tar -xzf apache-hive-${HIVE_VERSION}-bin.tar.gz \
    && rm apache-hive-${HIVE_VERSION}-bin.tar.gz
ENV HIVE_HOME=/apache-hive-${HIVE_VERSION}-bin
ENV PATH=$HIVE_HOME/bin:$PATH

# Install Hive ODBC driver
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      libsasl2-modules-gssapi-mit \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && cd /tmp \
    && wget --no-verbose https://downloads.cloudera.com/connectors/ClouderaHive_ODBC_${HIVE_ODBC_VERSION}/Debian/clouderahiveodbc_${HIVE_ODBC_VERSION_FULL}.deb \
    && dpkg -i clouderahiveodbc_${HIVE_ODBC_VERSION_FULL}.deb \
    && odbcinst -i -d -f /opt/cloudera/hiveodbc/Setup/odbcinst.ini \
    && rm /tmp/clouderahiveodbc_${HIVE_ODBC_VERSION_FULL}.deb

# Install Impala ODBC dependency
RUN cd /tmp \
    && wget --no-verbose https://downloads.cloudera.com/connectors/impala_odbc_${IMPALA_ODBC_VERSION}/Debian/clouderaimpalaodbc_${IMPALA_ODBC_VERSION_FULL}.deb \
    && dpkg -i clouderaimpalaodbc_${IMPALA_ODBC_VERSION_FULL}.deb \
    && odbcinst -i -d -f /opt/cloudera/impalaodbc/Setup/odbcinst.ini \
    && rm -rf /tmp/clouderaimpalaodbc_${IMPALA_ODBC_VERSION_FULL}.deb \
    && sed -i 's/DriverManagerEncoding=UTF-32/DriverManagerEncoding=UTF-16/g' /opt/cloudera/impalaodbc/lib/64/cloudera.impalaodbc.ini

# JAVA_HOME define
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Add hdfs command line
RUN cd / \
    && mkdir hadoop \
    && cd hadoop \
    && wget --no-verbose https://archive.apache.org/dist/hadoop/core/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz \
    && tar xf hadoop-${HADOOP_VERSION}.tar.gz \
    && rm hadoop-${HADOOP_VERSION}.tar.gz \
    && rm -rf hadoop-${HADOOP_VERSION}/etc/hadoop/ \
    && ln -s /etc/hadoop/conf hadoop-${HADOOP_VERSION}/etc/hadoop
ENV HADOOP_HOME=/hadoop/hadoop-${HADOOP_VERSION}
ENV PATH=$PATH:$HADOOP_HOME/bin

# Packages install
RUN install2.r --error --skipinstalled \
    arrow \
    openxlsx \
    odbc

# Install aws.s3 from saagie github (fix connection to OVH)
RUN R -e "devtools::install_github('saagie/aws.s3@v0.3.22.1')"

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

WORKDIR /sandbox

CMD ["/bin/bash", "-c", "/entrypoint.sh"]
