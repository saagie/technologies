# As rocker/r-apt:bionic is still based on R 3.x we have to start from an ubuntu image and add R4.0  and it's repositories ourselves
FROM ubuntu:bionic

LABEL maintainer="Saagie <yann.petit@saagie.com>"

USER root

ENV DEBIAN_FRONTEND noninteractive

ARG APACHE_URL="https://archive.apache.org/dist"

########################## ADAPT FROM R-APT START ##########################
## Set a default user. Available via runtime flag `--user docker`
## Add user to 'staff' group, granting them write privileges to /usr/local/lib/R/site.library
## User should also have & own a home directory (for rstudio or linked volumes to work properly).
RUN useradd docker \
    && mkdir /home/docker \
    && chown docker:docker /home/docker \
    && addgroup docker staff \
    && rm -rf /var/log/*

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        software-properties-common \
        ed \
        less \
        locales \
        vim-tiny \
        wget \
        ca-certificates \
        gnupg2 \
        krb5-user \
    && add-apt-repository --enable-source --yes "ppa:marutter/rrutter4.0" \
    && add-apt-repository --enable-source --yes "ppa:c2d4u.team/c2d4u4.0+" \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /tmp/* \
    && rm -rf /var/log/*

## Configure default locale, see https://github.com/rocker-org/rocker/issues/19
RUN echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen en_US.utf8 \
    && /usr/sbin/update-locale LANG=en_US.UTF-8

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
########################## ADAPT FROM R-APT END ##########################

# Now install R 4.0 and littler, and create a link for littler in /usr/local/bin
# Default CRAN repo is now set by R itself, and littler knows about it too
# r-cran-docopt is not currently in c2d4u so we install from source
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
          littler \
          r-base \
          r-base-dev \
          r-recommended \
          r-cran-rcpp \
    && ln -s /usr/lib/R/site-library/littler/examples/install.r /usr/local/bin/install.r \
    && ln -s /usr/lib/R/site-library/littler/examples/install2.r /usr/local/bin/install2.r \
    && ln -s /usr/lib/R/site-library/littler/examples/installGithub.r /usr/local/bin/installGithub.r \
    && ln -s /usr/lib/R/site-library/littler/examples/testInstalled.r /usr/local/bin/testInstalled.r \
    && install.r docopt \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /tmp/* \
    && rm -rf /var/log/*

# Install system libraries required by R packages
RUN apt-get update -qq \
    && apt-get install -qyq --no-install-recommends \
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
RUN apt update -qq && apt install -yqq --no-install-recommends \
      libsasl2-modules-gssapi-mit \
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
