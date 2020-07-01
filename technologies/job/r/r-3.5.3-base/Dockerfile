FROM rocker/tidyverse:3.5.3

USER root

ENV DEBIAN_FRONTEND noninteractive

ENV HADOOP_CONF_DIR=/etc/hadoop/conf
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

# Install system libraries required by R packages
RUN apt update -qq && apt install -qqy --no-install-recommends \
      libcups2 libcups2-dev openjdk-8-jdk systemd \
      unixodbc-dev libbz2-dev libgsl-dev odbcinst libx11-dev mesa-common-dev libglu1-mesa-dev \
      gdal-bin proj-bin libgdal-dev libproj-dev libudunits2-dev libtcl8.6 libtk8.6 libgtk2.0-dev \
      krb5-user \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*;

RUN mkdir /root/.R/ \
    && echo CXXFLAGS=-DBOOST_PHOENIX_NO_VARIADIC_EXPRESSION > /root/.R/Makevars

# Install Saagie's RStudio Addin
RUN R -e "install.packages('devtools')" && \
  R -e "devtools::install_github('saagie/rstudio-saagie-addin')"

# Be sure rstudio user has full access to his home directory
RUN mkdir -p /home/rstudio && \
  chown -R rstudio:rstudio /home/rstudio && \
  chmod -R 755 /home/rstudio

# Install Impala ODBC dependency
RUN cd /tmp && \
  wget --no-verbose https://downloads.cloudera.com/connectors/impala_odbc_2.5.41.1029/Debian/clouderaimpalaodbc_2.5.41.1029-2_amd64.deb && \
  dpkg -i clouderaimpalaodbc_2.5.41.1029-2_amd64.deb && \
  odbcinst -i -d -f /opt/cloudera/impalaodbc/Setup/odbcinst.ini && \
  rm /tmp/clouderaimpalaodbc_2.5.41.1029-2_amd64.deb

# Install Hive ODBC driver
RUN apt update -qq && apt install -yqq --no-install-recommends \
      libsasl2-modules-gssapi-mit && \
    rm -rf /var/lib/apt/lists/* && \
    cd /tmp && \
    wget --no-verbose https://downloads.cloudera.com/connectors/ClouderaHive_ODBC_2.6.4.1004/Debian/clouderahiveodbc_2.6.4.1004-2_amd64.deb && \
    dpkg -i clouderahiveodbc_2.6.4.1004-2_amd64.deb && \
    odbcinst -i -d -f /opt/cloudera/hiveodbc/Setup/odbcinst.ini && \
    rm /tmp/clouderahiveodbc_2.6.4.1004-2_amd64.deb

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

CMD ["/bin/sh", "-c", "/entrypoint"]
