FROM debian:stretch

ARG HADOOP_VERSION="2.6.0"
ARG HIVE_VERSION="1.1.0"
ARG SQOOP_VERSION="1.4.6"
ARG CDH_MAJOR="5"
ARG CDH_MINOR="13.0"
ARG CDH_VERSION="$CDH_MAJOR.$CDH_MINOR"
ARG CDH_URL="https://archive.cloudera.com/cdh$CDH_MAJOR/cdh/$CDH_MAJOR"

ENV DEBIAN_FRONTEND noninteractive

# LIGHT DEPENDENCIES START
RUN apt update -qq && apt install -qqy --no-install-recommends \
      ftp wget curl unzip telnet openssh-client git \
    && rm -rf /var/lib/apt/lists/*;
# LIGHT DEPENDENCIES END

# INSTALL JAVA & BEELINE START
# INSTALL JDK8
RUN apt update -qq && apt install -qqy --no-install-recommends \
      openjdk-8-jdk \
    && rm -rf /var/lib/apt/lists/*;
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# Hadoop client installation
ARG HADOOP_NAME=hadoop-$HADOOP_VERSION-cdh$CDH_VERSION
RUN wget --no-verbose $CDH_URL/$HADOOP_NAME.tar.gz \
    && tar -xzf $HADOOP_NAME.tar.gz \
    && rm $HADOOP_NAME.tar.gz \
    && mv $HADOOP_NAME /usr/lib/hadoop

ENV HADOOP_PREFIX=/usr/lib/hadoop
ENV PATH=$PATH:$HADOOP_PREFIX/bin
ENV HADOOP_COMMON_HOME=$HADOOP_PREFIX
ENV HADOOP_CONF_DIR=/etc/hadoop/conf

# Hive client installation
ARG HIVE_NAME=hive-$HIVE_VERSION-cdh$CDH_VERSION
RUN wget --no-verbose $CDH_URL/$HIVE_NAME.tar.gz \
    && tar -xvzf $HIVE_NAME.tar.gz \
    && mkdir -p /usr/lib/hive-hcatalog/share/hcatalog/ \
    && ln -s /$HIVE_NAME/hcatalog/share/hcatalog/hive-hcatalog-core-$HIVE_VERSION-cdh$CDH_VERSION.jar /usr/lib/hive-hcatalog/share/hcatalog/hive-hcatalog-core.jar \
    && rm $HIVE_NAME.tar.gz

ENV HIVE_HOME=/$HIVE_NAME
ENV PATH=$PATH:$HIVE_HOME/bin
ENV HIVE_CONF_DIR=/etc/hive/conf
# INSTALL JAVA & BEELINE END

# Sqoop client installation
ARG SQOOP_NAME=sqoop-$SQOOP_VERSION-cdh$CDH_VERSION
RUN wget --no-verbose $CDH_URL/$SQOOP_NAME.tar.gz \
    && tar -xvzf $SQOOP_NAME.tar.gz \
    && rm $SQOOP_NAME.tar.gz \
    && cp /$HIVE_NAME/lib/*.jar /$SQOOP_NAME/lib/

ENV SQOOP_HOME=/$SQOOP_NAME
ENV PATH=$PATH:$SQOOP_HOME/bin
ENV HADOOP_HOME=$HADOOP_PREFIX

# INSTALL PROCPS (ps) START
RUN apt update -qq && apt install -qqy --no-install-recommends \
      procps \
    && rm -rf /var/lib/apt/lists/*;
# INSTALL PROCPS (ps) END

RUN apt update -qq && apt install -yqq --no-install-recommends \
      krb5-user && \
    rm -rf /var/lib/apt/lists/*;

ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

COPY lib/*.jar /$SQOOP_NAME/lib/

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
