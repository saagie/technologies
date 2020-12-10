FROM apache/zeppelin:0.9.0

LABEL maintainer="Saagie"

ENV DEBIAN_FRONTEND noninteractive

# Set Saagie's cluster Java version
ENV JAVA_VERSION 8.131
ENV APACHE_SPARK_VERSION 2.4.5
ENV HADOOP_VERSION 2.6

# Set Hadoop default conf dir
ENV HADOOP_HOME /etc/cluster/hadoop
ENV HADOOP_CONF_DIR ${HADOOP_HOME}

ENV SPARK_BASE_DIR /usr/local/spark
ENV SPARK_HOME ${SPARK_BASE_DIR}/${APACHE_SPARK_VERSION}

# Set Hive default conf dir
ENV ZEPPELIN_INTP_CLASSPATH_OVERRIDES /etc/cluster/hive
# Default notebooks directory
ENV ZEPPELIN_NOTEBOOK_DIR '/notebook'
ENV ZEPPELIN_RUN_MODE local

########################## LIBS PART BEGIN ##########################
USER root
# FIXME Remove once apache/zeppelin image will include PR :
# https://github.com/apache/zeppelin/pull/3755
# correcting issue :  https://issues.apache.org/jira/browse/ZEPPELIN-4783
# and once docker image will be rebuild
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 51716619E084DAB9 \
    && apt-get -qq update && apt-get -qq install -y --no-install-recommends \
      jq \
      vim \
      krb5-user \
    && rm -rf /var/lib/apt/lists/*
########################## LIBS PART END ##########################


########################## Install Spark BEGIN ##########################
# Install Spark ${APACHE_SPARK_VERSION}
RUN mkdir -p ${SPARK_BASE_DIR} \
    && SPARK_DISTRIB="spark-${APACHE_SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}" \
    && curl -fSL https://archive.apache.org/dist/spark/spark-${APACHE_SPARK_VERSION}/${SPARK_DISTRIB}.tgz -o ${SPARK_BASE_DIR}/${SPARK_DISTRIB}.tgz \
    && tar -xzf ${SPARK_BASE_DIR}/${SPARK_DISTRIB}.tgz -C ${SPARK_BASE_DIR} \
    && rm -rf ${SPARK_BASE_DIR}/${SPARK_DISTRIB}.tgz \
    && cp ${SPARK_BASE_DIR}/${SPARK_DISTRIB}/conf/log4j.properties.template ${SPARK_BASE_DIR}/${SPARK_DISTRIB}/conf/log4j.properties \
    && ln -s ${SPARK_BASE_DIR}/${SPARK_DISTRIB} ${SPARK_HOME}

########################## Install Spark END ##########################

# Add a startup script that will setup Spark conf before running Zeppelin
COPY resources/saagie-zeppelin.sh /zeppelin
COPY resources/saagie-zeppelin-config.sh /zeppelin
RUN chmod 744 /zeppelin/saagie-zeppelin.sh /zeppelin/saagie-zeppelin-config.sh \
    && mkdir ${ZEPPELIN_NOTEBOOK_DIR} \
# Add CRON to copy interpreter.json to persisted folder
    && echo "* * * * * cp -f /zeppelin/conf/interpreter.json ${ZEPPELIN_NOTEBOOK_DIR}/" >> mycron \
    && crontab mycron \
    && rm mycron

# Keep default ENTRYPOINT as apache/zeppelin is using Tini, which is great.
CMD ["/zeppelin/saagie-zeppelin.sh"]
