FROM python:3.9.15-bullseye

RUN mkdir /mlflow/

RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get clean;

RUN cd / \
    && mkdir app \
    && cd app \
    && wget https://archive.apache.org/dist/hadoop/common/hadoop-2.6.5/hadoop-2.6.5.tar.gz \
    && tar xvf hadoop-2.6.5.tar.gz \
    && rm hadoop-2.6.5.tar.gz \
    && rm -rf hadoop-2.6.5/etc/hadoop \
    && ln -s /etc/hadoop/conf hadoop-2.6.5/etc/hadoop;

ENV PATH "/app/hadoop-2.6.5/bin:${PATH}"

RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64/
ENV HADOOP_HOME=/app/hadoop-2.6.5
ENV HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop-2.6.5

RUN pip install --upgrade pip
RUN pip install SQLAlchemy mysqlclient pyarrow boto3 psycopg2-binary==2.8.5 protobuf==3.20.* mlflow==2.0.1

COPY resources/entrypoint.sh entrypoint.sh

EXPOSE 5000

ENTRYPOINT [ "./entrypoint.sh" ]
