FROM rocker/tidyverse:3.4.2

USER root

ENV DEBIAN_FRONTEND noninteractive

ENV CDH_MAIN_VERSION 5
ENV CDH_VERSION ${CDH_MAIN_VERSION}.7.1
ENV HADOOP_VERSION 2.6.0
ENV HIVE_VERSION 1.2.2
ENV HIVE_ODBC_VERSION 2.6.4.1004
ENV HIVE_ODBC_VERSION_FULL ${HIVE_ODBC_VERSION}-2_amd64
ENV IMPALA_ODBC_VERSION 2.5.41.1029
ENV IMPALA_ODBC_VERSION_FULL ${IMPALA_ODBC_VERSION}-2_amd64
ENV APACHE_SPARK_VERSION 2.1.0
ENV SPARK_HADOOP_VERSION 2.7

# Install system libraries required by R packages
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        krb5-user \
        libcups2 libcups2-dev openjdk-8-jdk systemd \
        unixodbc-dev libbz2-dev libgsl-dev odbcinst libx11-dev mesa-common-dev libglu1-mesa-dev \
        gdal-bin proj-bin libgdal-dev libproj-dev libudunits2-dev libtcl8.6 libtk8.6 libgtk2.0-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Hadoop client installation
# TODO use oneline curl/wget with env var to simplify
RUN wget --no-verbose http://archive.cloudera.com/cdh${CDH_MAIN_VERSION}/cdh/${CDH_MAIN_VERSION}/hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION}.tar.gz \
    && tar -xzf hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION}.tar.gz \
    && rm hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION}.tar.gz \
    && mv hadoop-${HADOOP_VERSION}-cdh${CDH_VERSION} /usr/local/hadoop
ENV HADOOP_HOME=/usr/local/hadoop
ENV PATH=$PATH:$HADOOP_HOME/bin

# Hive client installation
# TODO use oneline curl -o with env var to simplify
RUN wget --no-verbose http://apache.mirrors.ovh.net/ftp.apache.org/dist/hive/hive-${HIVE_VERSION}/apache-hive-${HIVE_VERSION}-bin.tar.gz \
    && tar -xvzf apache-hive-${HIVE_VERSION}-bin.tar.gz \
    && rm apache-hive-${HIVE_VERSION}-bin.tar.gz
ENV HIVE_HOME=/apache-hive-${HIVE_VERSION}-bin
ENV PATH=$HIVE_HOME/bin:$PATH

# Install Hive ODBC driver
RUN apt update -qq && apt install -yqq --no-install-recommends \
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
    && rm -rf /tmp/clouderaimpalaodbc_${IMPALA_ODBC_VERSION_FULL}.deb

# JAVA_HOME define
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Install Spark
RUN curl -s https://archive.apache.org/dist/spark/spark-${APACHE_SPARK_VERSION}/spark-${APACHE_SPARK_VERSION}-bin-hadoop${SPARK_HADOOP_VERSION}.tgz | tar -xz -C /usr/local/ \
    && ln -s /usr/local/spark-${APACHE_SPARK_VERSION}-bin-hadoop${SPARK_HADOOP_VERSION} /usr/local/spark
ENV SPARK_HOME /usr/local/spark
ENV SPARK_OPTS --driver-java-options=-Xms1024M --driver-java-options=-Xmx4096M --driver-java-options=-Dlog4j.logLevel=info


#####################################
### START R LIBS INTALLATION Part ###
###

# TODO check if this one is necessarily installd before others ...
# TODO use requirements file to make this docker file more readable
RUN R -e "install.packages('sparklyr', repos='http://cran.rstudio.com/', dependencies=T)"

# Install Saagie's RStudio Addin
RUN R -e "install.packages('devtools')" && \
    R -e "devtools::install_github('saagie/rstudio-saagie-addin')"

# Install R packages
RUN R CMD javareconf && \
 R -e "install.packages('ade4')" && \
 R -e "install.packages('argparse')" && \
 R -e "install.packages('arules')" && \
 R -e "install.packages('arulesSequences')" && \
 R -e "install.packages('AUC')" && \
 R -e "install.packages('breakpoint')" && \
 R -e "install.packages('betareg')" && \
 R -e "install.packages('cairoDevice', INSTALL_opts='--no-test-load')" && \
 R -e "install.packages('caret')" && \
 R -e "install.packages('caretEnsemble')" && \
 R -e "install.packages('cartography')" && \
 R -e "install.packages('changepoint')" && \
 R -e "install.packages('classInt')" && \
 R -e "install.packages('cluster')" && \
 R -e "install.packages('colorspace')" && \
 R -e "install.packages('colourpicker')" && \
 R -e "install.packages('corrplot')" && \
 R -e "install.packages('curl')" && \
 R -e "install.packages('d3heatmap')" && \
 R -e "install.packages('data.table')" && \
 R -e "install.packages('dbscan')" && \
 R -e "install.packages('DescTools')" && \
 R -e "install.packages('doParallel')" && \
 R -e "install.packages('doSNOW')" && \
 R -e "install.packages('dtplyr')" && \
 R -e "install.packages('dtw')" && \
 R -e "install.packages('dummies')" && \
 R -e "install.packages('dygraphs')" && \
 R -e "install.packages('e1071')" && \
 R -e "install.packages('factoextra')" && \
 R -e "install.packages('FactoInvestigate')" && \
 R -e "install.packages('FactoMineR')" && \
 R -e "install.packages('Factoshiny')" && \
 R -e "install.packages('ff')" && \
 R -e "install.packages('ffbase')" && \
 R -e "install.packages('FNN')" && \
 R -e "install.packages('forecast')" && \
 R -e "install.packages('futile.logger')" && \
 R -e "install.packages('ggplot2')" && \
 R -e "install.packages('glmnet')" && \
 R -e "install.packages('h2o')" && \
 R -e "install.packages('hunspell')" && \
 R -e "install.packages('implyr')" && \
 R -e "install.packages('jsonlite')" && \
 R -e "install.packages('kernlab')" && \
 R -e "install.packages('kknn')" && \
 R -e "install.packages('knitr')" && \
 R -e "install.packages('kohonen')" && \
 R -e "install.packages('labeling')" && \
 R -e "install.packages('LDAvis')" && \
 R -e "install.packages('leaflet')" && \
 R -e "install.packages('leaps')" && \
 R -e "install.packages('lsa')" && \
 R -e "install.packages('magrittr')" && \
 R -e "install.packages('mapproj')" && \
 R -e "install.packages('maps')" && \
 R -e "install.packages('maptools')" && \
 R -e "install.packages('markdown')" && \
 R -e "install.packages('mclust')" && \
 R -e "install.packages('missMDA')" && \
 R -e "install.packages('mlogit')" && \
 R -e "install.packages('mvoutlier')" && \
 R -e "install.packages('networkD3')" && \
 R -e "install.packages('odbc')" && \
 R -e "install.packages('packrat')" && \
 R -e "install.packages('plotly')" && \
 R -e "install.packages('pls')" && \
 R -e "install.packages('pROC')" && \
 R -e "install.packages('proxy')" && \
 R -e "install.packages('pvclust')" && \
 R -e "install.packages('randomForest')" && \
 R -e "install.packages('rattle')" && \
 R -e "install.packages('RcmdrMisc')" && \
 R -e "install.packages('RColorBrewer')" && \
 R -e "install.packages('Rcpp')" && \
 R -e "install.packages('readr')" && \
 R -e "install.packages('readxl')" && \
 R -e "install.packages('recommenderlab')" && \
 R -e "install.packages('reshape2')" && \
 R -e "install.packages('rJava')" && \
 R -e "install.packages('RJDBC')" && \
 R -e "install.packages('rjson')" && \
 R -e "install.packages('RMySQL')" && \
 R -e "install.packages('ROCR')" && \
 R -e "install.packages('ROSE')" && \
 R -e "install.packages('rpart')" && \
 R -e "install.packages('rpart.plot')" && \
 R -e "install.packages('RSelenium')" && \
 R -e "install.packages('rsparkling')" && \
 R -e "install.packages('RTextTools')" && \
 R -e "install.packages('Rtsne')" && \
 R -e "install.packages('rvest')" && \
 R -e "install.packages('RWeka')" && \
 R -e "install.packages('sas7bdat')" && \
 R -e "install.packages('scales')" && \
 R -e "install.packages('shiny')" && \
 R -e "install.packages('shinydashboard')" && \
 R -e "install.packages('shinyjs')" && \
 R -e "install.packages('shinythemes')" && \
 R -e "install.packages('skmeans')" && \
 R -e "install.packages('SnowballC')" && \
 R -e "install.packages('sp')" && \
 R -e "install.packages('sqldf')" && \
 R -e "install.packages('stringi')" && \
 R -e "install.packages('stringr')" && \
 R -e "install.packages('syuzhet')" && \
 R -e "install.packages('tm')" && \
 R -e "install.packages('topicmodels')" && \
 R -e "install.packages('trend')" && \
 R -e "install.packages('TSclust')" && \
 R -e "install.packages('tseries')" && \
 R -e "install.packages('tree')" && \
 R -e "install.packages('wordcloud')" && \
 R -e "install.packages('xgboost')" && \
 R -e "install.packages('xlsx')" && \
 R -e "install.packages('xts')"

RUN mkdir /root/.R/
RUN echo CXXFLAGS=-DBOOST_PHOENIX_NO_VARIADIC_EXPRESSION > /root/.R/Makevars
RUN R -e "install.packages('prophet')"

                                ###
### END R LIBS INTALLATION Part ###
###################################

# Nginx isntall and remove default conf
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/ \
    && rm /etc/nginx/sites-enabled/default
COPY resources/server.conf /etc/nginx/sites-enabled/rstudio.conf

# Store Root envvar to be able to exclude it at runtime when propagating envvars to every user
RUN env >> /ROOT_ENV_VAR && chmod 400 /ROOT_ENV_VAR

COPY resources/userconf /etc/cont-init.d/userconf
COPY resources/init_rstudio.sh /init_rstudio.sh
# Be sure rstudio user has full access to his home directory
RUN mkdir -p /home/rstudio && \
    chown -R rstudio:rstudio /home/rstudio && \
    chmod -R 755 /home/rstudio && \
    chmod 500 /init_rstudio.sh

EXPOSE 80

COPY resources/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["/bin/sh", "-c", "/init_rstudio.sh"]
