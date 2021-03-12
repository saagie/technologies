ARG BASE_CONTAINER="saagie/jupyter-python-nbk:v2-1.71.0"

# hadolint ignore=DL3006
FROM $BASE_CONTAINER

LABEL Maintainer="Saagie"

ENV DEBIAN_FRONTEND noninteractive

USER root

# Install tools & java
# hadolint ignore=DL3008
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
      vim \
      nano \
      gnupg2 \
      openjdk-8-jre-headless \
      ca-certificates-java \
    && rm -rf /var/lib/apt/lists/*

ENV HADOOP_CONF_DIR /home/jovyan/hadoop
RUN mkdir -p $HADOOP_CONF_DIR \
    && mkdir -p /usr/lib/impala/lib/ \
    && chown "${NB_UID}" /usr/lib/impala/lib \
    && sed -i '2iln -s /etc/hadoop/conf/sentry-libs/hive-hcatalog-core.jar /usr/lib/impala/lib/hive-hcatalog-core.jar' /usr/local/bin/start-notebook.sh

#Installing Spark
ARG SPARK_VERSION="2.4.5"
ARG HADOOP_VERSION="2.6"
ARG SPARK_FILENAME="spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}"
RUN curl -Ls "https://archive.apache.org/dist/spark/${SPARK_FILENAME}.tgz" | tar xzf - -C "/usr/local/"  \
    && ln -s "/usr/local/${SPARK_FILENAME}/" "/usr/local/spark"
ENV SPARK_HOME /usr/local/spark
# Spark config
ENV PORT0 4040
ENV PORT1 20022
ENV SPARK_OPTS --driver-java-options=-Xms1024M --driver-java-options=-Xmx4096M --driver-java-options=-Dlog4j.logLevel=info

# Add sentry jars for Spark
WORKDIR /usr/local/spark/jars
ARG CLOUDERA_URL="https://repository.cloudera.com/artifactory/cloudera-repos/org/apache/sentry"
RUN curl -LOs "${CLOUDERA_URL}/sentry-hdfs-namenode-plugin/1.5.1-cdh5.16.2/sentry-hdfs-namenode-plugin-1.5.1-cdh5.16.2.jar" \
    && curl -LOs "${CLOUDERA_URL}/sentry-hdfs-dist/1.5.1-cdh5.16.2/sentry-hdfs-dist-1.5.1-cdh5.16.2.jar" \
    && curl -LOs "${CLOUDERA_URL}/sentry-hdfs-common/1.5.1-cdh5.16.2/sentry-hdfs-common-1.5.1-cdh5.16.2.jar"
WORKDIR /notebooks-dir

# Install conda libs (pyarrow/pyspark)
USER ${NB_USER}
COPY resources/requirements_conda.txt "/home/${NB_USER}/requirements_conda.txt"
RUN conda install -n py36 --quiet --yes --file "/home/${NB_USER}/requirements_conda.txt" && \
    conda clean -ay

#Install scala kernel
RUN conda create -n scala python=3.6 \
    && bash -c "source activate scala && conda install spylon-kernel=0.4.1 && python -m spylon_kernel install --user --name scalakernel" \
    && sed -i 's:spylon-kernel:Scala:g' /home/jovyan/.local/share/jupyter/kernels/scalakernel/kernel.json \
    && conda clean -ay \
    && rm -rf ~/.cache/pip

USER root
# Replace default entrypoint
COPY resources/entrypoint.sh /entrypoint
COPY resources/nginx.conf /etc/nginx/sites-available/default

ENV PYTHONPATH "${SPARK_HOME}/python:${SPARK_HOME}/python/lib/py4j-0.10.7-src.zip"
COPY resources/spark-env.sh "${SPARK_HOME}/conf/spark-env.sh"
RUN chown "${NB_USER}":"${NB_UID}" "${SPARK_HOME}/conf/spark-env.sh" \
    && chmod +x "${SPARK_HOME}/conf/spark-env.sh"

# Should run as ${NB_USER}  ... but ...
# USER ${NB_USER}
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
# hadolint ignore=DL3002
USER root

ENTRYPOINT ["/entrypoint"]
