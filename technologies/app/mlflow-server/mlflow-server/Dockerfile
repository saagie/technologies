FROM python:3.7.0

RUN mkdir /mlflow/

RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

RUN cd / \
    && mkdir app \
    && cd app \
    && wget https://archive.apache.org/dist/hadoop/common/hadoop-2.6.0/hadoop-2.6.0.tar.gz \
    && tar xvf hadoop-2.6.0.tar.gz \
    && rm hadoop-2.6.0.tar.gz \
    && rm -rf hadoop-2.6.0/etc/hadoop \
    && ln -s /etc/hadoop/conf hadoop-2.6.0/etc/hadoop;

ENV PATH "/app/hadoop-2.6.0/bin:${PATH}"

RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
ENV HADOOP_HOME=/app/hadoop-2.6.0
ENV HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop-2.6.0

RUN pip install --upgrade pip
RUN pip install mlflow==1.16

RUN pip install SQLAlchemy mysqlclient pyarrow psycopg2-binary==2.8.5

EXPOSE 5000

CMD mlflow server \
    --backend-store-uri ${MLFLOW_BACKEND_STORE_URI} \
    --default-artifact-root ${MLFLOW_DEFAULT_ARTIFACTORY_ROOT} \
    --host 0.0.0.0
