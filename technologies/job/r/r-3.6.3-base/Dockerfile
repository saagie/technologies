FROM rocker/r-apt:bionic

LABEL maintainer="Saagie <yann.petit@saagie.com>"

USER root

ENV DEBIAN_FRONTEND noninteractive

ENV HADOOP_CONF_DIR=/etc/hadoop/conf
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

# Install system libraries required by R packages
RUN apt update -qq && apt install -qqy --no-install-recommends \
      libcups2 libcups2-dev openjdk-11-jdk systemd \
      unixodbc-dev libbz2-dev libgsl-dev odbcinst libx11-dev mesa-common-dev libglu1-mesa-dev \
      gdal-bin proj-bin libgdal-dev libproj-dev libudunits2-dev libtcl8.6 libtk8.6 libgtk2.0-dev \
      krb5-user \
      libgit2-dev \
    && rm -rf /var/cache/* \
    && rm -rf /tmp/* \
    && rm -rf /var/log/* \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /root/.R/ \
    && echo CXXFLAGS=-DBOOST_PHOENIX_NO_VARIADIC_EXPRESSION > /root/.R/Makevars \
    && R CMD javareconf

# Install Saagie's RStudio Addin
RUN R -e "install.packages(c('Rcpp','RTools','devtools'))" \
    && R -e "devtools::install_github('saagie/rstudio-saagie-addin')"

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

# Install Hive ODBC driver
ARG HIVE_ODBC_VERSION="2.6.4.1004"
ARG HIVE_ODBC_FILE="clouderahiveodbc_${HIVE_ODBC_VERSION}-2_amd64.deb"
ARG HIVE_ODBC_URL="https://downloads.cloudera.com/connectors/ClouderaHive_ODBC_${HIVE_ODBC_VERSION}/Debian/${HIVE_ODBC_FILE}"
RUN apt update -qq && apt install -yqq --no-install-recommends \
      libsasl2-modules-gssapi-mit && \
    rm -rf /var/lib/apt/lists/* && \
    cd /tmp && \
    wget --no-verbose "${HIVE_ODBC_URL}" && \
    dpkg -i "${HIVE_ODBC_FILE}" && \
    odbcinst -i -d -f /opt/cloudera/hiveodbc/Setup/odbcinst.ini && \
    rm "/tmp/${HIVE_ODBC_FILE}" \
    && rm -rf /var/log/* \
    && rm -rf /var/cache/*

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

CMD ["/bin/sh", "-c", "/entrypoint"]
