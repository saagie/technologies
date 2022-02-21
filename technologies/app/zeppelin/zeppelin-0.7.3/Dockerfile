FROM apache/zeppelin:0.7.3

LABEL maintainer=Saagie

ENV DEBIAN_FRONTEND noninteractive

# Set Saagie's cluster Java version
ENV JAVA_VERSION 8.131
ENV APACHE_SPARK_VERSION 2.1.0

# Set Hadoop default conf dir
ENV HADOOP_HOME /etc/cluster/hadoop
ENV HADOOP_CONF_DIR /etc/cluster/hadoop

# Set Spark 2.1.0 as the default one
ENV SPARK_HOME /usr/local/spark/2.1.0

# Set Hive default conf dir
ENV ZEPPELIN_INTP_CLASSPATH_OVERRIDES /etc/cluster/hive

# Default notebooks directory
ENV ZEPPELIN_NOTEBOOK_DIR '/notebook'

########################## LIBS PART BEGIN ##########################
USER root
RUN apt-get -qq update && apt-get -yqq install --no-install-recommends \
      jq \
      vim \
      krb5-user \
    && rm -rf /var/lib/apt/lists/*
########################## LIBS PART END ##########################

########################## Install Spark 2.1.0 for Hadoop 2.6 BEGIN ##########################
RUN cd /tmp && wget https://archive.apache.org/dist/spark/spark-2.1.0/spark-2.1.0-bin-hadoop2.6.tgz -O /tmp/spark-2.1.0-bin-hadoop2.6.tgz && \
  tar -xzf spark-2.1.0-bin-hadoop2.6.tgz && \
  cp spark-2.1.0-bin-hadoop2.6/conf/log4j.properties.template spark-2.1.0-bin-hadoop2.6/conf/log4j.properties && \
  mkdir -p /usr/local/spark/2.1.0 && mv spark-2.1.0-bin-hadoop2.6/* /usr/local/spark/2.1.0 && \
  rm -rf spark-2.1.0-bin-hadoop2.6.tgz spark-2.1.0-bin-hadoop2.6
########################## Install Spark END ##########################

# Add a startup script that will setup Spark conf before running Zeppelin
COPY resources/saagie-zeppelin.sh /zeppelin
COPY resources/saagie-zeppelin-config.sh /zeppelin
RUN chmod 744 /zeppelin/saagie-zeppelin.sh /zeppelin/saagie-zeppelin-config.sh && \
# Add CRON to copy interpreter.json to persisted folder
    echo "* * * * * cp -f /zeppelin/conf/interpreter.json /notebook/" >> mycron && \
    crontab mycron && \
    rm mycron

# Keep default ENTRYPOINT as apache/zeppelin is using Tini, which is great.
CMD ["/zeppelin/saagie-zeppelin.sh"]
