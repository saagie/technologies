FROM debian:stretch

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

# LIGHT DEPENDENCIES START
RUN apt-get update
RUN apt-get install -y ftp wget curl unzip telnet openssh-client
# LIGHT DEPENDENCIES END

# INSTALL JAVA & BEELINE START
# INSTALL JDK8
RUN apt-get install -y openjdk-8-jdk
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# Hadoop client installation
RUN wget --no-verbose https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.13.0.tar.gz \
    && tar -xzf hadoop-2.6.0-cdh5.13.0.tar.gz \
    && rm hadoop-2.6.0-cdh5.13.0.tar.gz \
    && mv hadoop-2.6.0-cdh5.13.0 /usr/lib/hadoop

ENV HADOOP_PREFIX=/usr/lib/hadoop
ENV PATH=$PATH:$HADOOP_PREFIX/bin
ENV HADOOP_COMMON_HOME=$HADOOP_PREFIX
ENV HADOOP_CONF_DIR=/etc/hadoop/conf

# Hive client installation
RUN wget --no-verbose http://archive.cloudera.com/cdh5/cdh/5/hive-1.1.0-cdh5.13.3.tar.gz \
    && tar -xvzf hive-1.1.0-cdh5.13.3.tar.gz \
    && rm hive-1.1.0-cdh5.13.3.tar.gz

ENV HIVE_HOME=/hive-1.1.0-cdh5.13.3
ENV PATH=$PATH:$HIVE_HOME/bin
ENV HIVE_CONF_DIR=/etc/hive/conf
# INSTALL JAVA & BEELINE END

# Sqoop client installation
RUN wget --no-verbose http://archive.cloudera.com/cdh5/cdh/5/sqoop-1.4.6-cdh5.13.0.tar.gz \
    && tar -xvzf sqoop-1.4.6-cdh5.13.0.tar.gz \
    && rm sqoop-1.4.6-cdh5.13.0.tar.gz \
    && cp /hive-1.1.0-cdh5.13.3/lib/*.jar /sqoop-1.4.6-cdh5.13.0/lib/

ENV SQOOP_HOME=/sqoop-1.4.6-cdh5.13.0
ENV PATH=$PATH:$SQOOP_HOME/bin
ENV HADOOP_HOME=$HADOOP_PREFIX

# INSTALL PROCPS (ps) START
RUN apt-get install -y procps
# INSTALL PROCPS (ps) END

#UPDATE SECURITY PACKAGE BEGIN
RUN apt-get update && apt-get upgrade -y
#UPDATE SECURITY PACKAGE END

COPY lib/*.jar /sqoop-1.4.6-cdh5.13.0/lib/

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
