FROM python:3.7.11-stretch

RUN mkdir /mlflow/

RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
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

ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
ENV HADOOP_HOME=/app/hadoop-2.6.5
ENV HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop-2.6.5

RUN pip install --upgrade pip
RUN pip install SQLAlchemy==1.4.46 mysqlclient pyarrow boto3 psycopg2-binary==2.8.5 protobuf==3.20.* mlflow==1.20.2

COPY resources/entrypoint.sh entrypoint.sh

EXPOSE 5000

ENTRYPOINT [ "./entrypoint.sh" ]
