FROM debian:stretch

ENV DEBIAN_FRONTEND noninteractive

# LIGHT DEPENDENCIES START
RUN apt update -qq && apt install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client git procps krb5-user && \
    rm -rf /var/lib/apt/lists/*;
# LIGHT DEPENDENCIES END

# INSTALL JAVA & BEELINE START
# INSTALL JDK8
RUN apt update -qq && apt install -yqq --no-install-recommends \
      openjdk-8-jdk && \
    rm -rf /var/lib/apt/lists/*;
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# Hadoop client installation
RUN wget --no-verbose https://archive.cloudera.com/cdh5/cdh/5/hadoop-2.6.0-cdh5.13.0.tar.gz; \
    tar -xzf hadoop-2.6.0-cdh5.13.0.tar.gz; \
    rm hadoop-2.6.0-cdh5.13.0.tar.gz; \
    mv hadoop-2.6.0-cdh5.13.0 /usr/lib/hadoop
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
# INSTALL JAVA & BEELINE END

ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

#UPDATE SECURITY PACKAGE BEGIN
RUN apt-get update -qq && \
    apt-get upgrade -yqq --no-install-recommends && \
    apt-get autoremove -yqq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*;
#UPDATE SECURITY PACKAGE END

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
