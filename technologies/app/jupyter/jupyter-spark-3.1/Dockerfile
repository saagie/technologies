# This is a deprecated image which will ne longer be maintained by Saagie.
FROM saagie/pyspark-3.1.1-1.111.0

#ARG BASE_CONTAINER="saagie/jupyter-python-nbk:lab-3.8-3.9-1.110.0"
#
#FROM $BASE_CONTAINER
#
#LABEL Maintainer="Saagie"
#
#ENV DEBIAN_FRONTEND noninteractive
#
#USER root
#
#RUN apt-get update -qq \
#    && apt-get install -yqq --no-install-recommends \
#      nginx \
#    && rm -rf /var/lib/apt/lists/*
#
#ENV PORT0 4040
#ENV PORT1 20022
#ENV SPARK_VERSION 3.1.3
#ENV HADOOP_VERSION 2.7
#ENV HIVE_VERSION 1.1.0
#ENV SPARK_HOME /usr/local/spark
#ENV PYTHONPATH $SPARK_HOME/python/:$SPARK_HOME/python/lib/py4j-0.10.9.3-src.zip
#ENV PYSPARK_PYTHON=python3
#ENV SPARK_OPTS --driver-java-options=-Xms1024M --driver-java-options=-Xmx4096M --driver-java-options=-Dlog4j.logLevel=info
#ENV HADOOP_CONF_DIR /etc/hadoop/conf
#
#
##Installing Spark
#RUN wget https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz -P /tmp \
#    && tar -zxf /tmp/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz -C /usr/local/  \
#    && ln -s /usr/local/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}/ /usr/local/spark \
#    && rm /tmp/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz
#
#
##Installing Hive jars
#RUN wget https://archive.apache.org/dist/hive/hive-${HIVE_VERSION}/apache-hive-${HIVE_VERSION}-bin.tar.gz -P /tmp \
#    && tar -zxf /tmp/apache-hive-${HIVE_VERSION}-bin.tar.gz -C /usr/local/  \
#    && ln -s /usr/local/apache-hive-${HIVE_VERSION}-bin/ /usr/local/hive \
#    && rm /tmp/apache-hive-${HIVE_VERSION}-bin.tar.gz
#
#WORKDIR /usr/local/spark/jars
#
#ARG CLOUDERA_URL="https://repository.cloudera.com/artifactory/cloudera-repos/org/apache/sentry"
#RUN curl -LOs "${CLOUDERA_URL}/sentry-hdfs-namenode-plugin/1.5.1-cdh5.16.2/sentry-hdfs-namenode-plugin-1.5.1-cdh5.16.2.jar" \
#    && curl -LOs "${CLOUDERA_URL}/sentry-hdfs-dist/1.5.1-cdh5.16.2/sentry-hdfs-dist-1.5.1-cdh5.16.2.jar" \
#    && curl -LOs "${CLOUDERA_URL}/sentry-hdfs-common/1.5.1-cdh5.16.2/sentry-hdfs-common-1.5.1-cdh5.16.2.jar" \
#    && chown -R "${NB_USER}":"${NB_UID}" /usr/local/spark/jars
#WORKDIR /notebooks-dir
#
#USER ${NB_USER}
#
#RUN sh -x \
#    && for env in py38 py39 py310;  \
#       do \
#          . activate $env \
#          && PYSPARK_HADOOP_VERSION=$HADOOP_VERSION python -m pip install pyspark==$SPARK_VERSION \
#          && conda deactivate; \
#       done \
#    && conda clean -ay \
#    && rm -rf ~/.cache/pip
#
#USER root
#COPY resources/entrypoint.sh /entrypoint
#COPY resources/nginx.conf /etc/nginx/sites-available/default
#COPY resources/spark-env.sh $SPARK_HOME/conf/spark-env.sh
#
##Setting default options
#RUN  echo 'spark.driver.extraJavaOptions -Dio.netty.tryReflectionSetAccessible=true' >> "${SPARK_HOME}/conf/spark-defaults.conf" && \
#    echo 'spark.executor.extraJavaOptions -Dio.netty.tryReflectionSetAccessible=true' >> "${SPARK_HOME}/conf/spark-defaults.conf" && \
#    echo 'spark.sql.hive.metastore.jars.path file:///usr/local/hive/lib/*' >> "${SPARK_HOME}/conf/spark-defaults.conf" && \
#    echo "spark.sql.hive.metastore.version ${HIVE_VERSION}" >> "${SPARK_HOME}/conf/spark-defaults.conf" && \
#    echo 'spark.sql.hive.metastore.jars path' >> "${SPARK_HOME}/conf/spark-defaults.conf"
#
#RUN chown $NB_USER:$NB_UID $SPARK_HOME/conf/spark-env.sh && \
#    chown $NB_USER:$NB_UID $SPARK_HOME/conf/spark-defaults.conf \
#    && chmod +x $SPARK_HOME/conf/spark-env.sh
#
## Should run as $NB_USER  ... but ...
## USER $NB_USER
## Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
#
#ENTRYPOINT ["/entrypoint"]
#
#
#
#
