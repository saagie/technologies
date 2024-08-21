ARG jre_major
FROM spark:3.5.2-scala2.12-java$jre_major-ubuntu

ENV PATH "$PATH:$SPARK_HOME/bin"
ENV LANG C.UTF-8

# LIGHT DEPENDENCIES START
USER root
RUN apt update -qq && apt install -yqq --no-install-recommends \
    wget curl unzip krb5-user zip && \
    rm -rf /var/lib/apt/lists/*s

COPY entrypoint.sh /opt/
RUN chmod 755 /opt/entrypoint.sh

USER spark

#See hadoop version used by spark and udpate if necessary.
#See https://mvnrepository.com/artifact/org.apache.hadoop/hadoop-aws/3.3.4 to get right version of aws-java-sdk-bundle
RUN wget -nv https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.12.262/aws-java-sdk-bundle-1.12.262.jar && \
    wget -nv https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/3.3.4/hadoop-aws-3.3.4.jar && \
    mv *.jar /opt/spark/jars/
