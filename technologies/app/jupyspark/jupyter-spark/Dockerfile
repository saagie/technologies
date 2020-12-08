ARG BASE_CONTAINER="saagie/jupyter-python-nbk:v2-1.61.0"

FROM $BASE_CONTAINER

LABEL Maintainer="Saagie"

ENV DEBIAN_FRONTEND noninteractive

# SAAGIE Spark dependencies
ENV SPARK_VERSION 2.4.5
ENV HADOOP_VERSION 2.6

USER root

# Install tools
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      vim nano gnupg2 && \
    rm -rf /var/lib/apt/lists/*;

# Installing Java
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends -y \
      openjdk-8-jre-headless ca-certificates-java && \
    rm -rf /var/lib/apt/lists/*

# Install Kerberos & ACL for Saagie
COPY resources/cloudera.list /etc/apt/sources.list.d/cloudera.list
RUN apt-key adv  --recv-keys --keyserver keyserver.ubuntu.com 327574EE02A818DD \
    && apt-get update -qq && apt-get install -yqq --no-install-recommends \
      krb5-user acl \
      freeipa-client sentry-hdfs-plugin \
      nginx \
    && rm -rf /var/lib/apt/lists/*;

# Spark config
ENV PORT0 4040
ENV PORT1 20022
ENV SPARK_HOME /usr/local/spark
ENV PYTHONPATH $SPARK_HOME/python:$SPARK_HOME/python/lib/py4j-0.10.7-src.zip
ENV SPARK_OPTS --driver-java-options=-Xms1024M --driver-java-options=-Xmx4096M --driver-java-options=-Dlog4j.logLevel=info
ENV HADOOP_CONF_DIR /home/jovyan/hadoop

RUN mkdir -p $HADOOP_CONF_DIR && \
    mkdir -p /usr/lib/impala/lib/ && \
    chown $NB_UID /usr/lib/impala/lib && \
    sed -i '2iln -s /etc/hadoop/conf/sentry-libs/hive-hcatalog-core.jar /usr/lib/impala/lib/hive-hcatalog-core.jar' /usr/local/bin/start-notebook.sh

#Installing Spark
RUN wget https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz -P /tmp \
    && tar -zxf /tmp/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz -C /usr/local/  \
    && ln -s /usr/local/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}/ /usr/local/spark \
    && rm /tmp/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz

# Install conda libs (pyarrow/pyspark)
USER $NB_UID
COPY resources/requirements_conda.txt /home/$NB_USER/requirements_conda.txt
RUN conda install -n py36 --quiet --yes --file /home/$NB_USER/requirements_conda.txt && \
    conda clean -ay

USER root
COPY resources/entrypoint.sh /entrypoint
COPY resources/nginx.conf /etc/nginx/sites-available/default
COPY resources/spark-env.sh $SPARK_HOME/conf/spark-env.sh
RUN chown $NB_USER:$NB_UID $SPARK_HOME/conf/spark-env.sh \
    && chmod +x $SPARK_HOME/conf/spark-env.sh

# Should run as $NB_USER  ... but ...
# USER $NB_USER
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root

ENTRYPOINT ["/entrypoint"]