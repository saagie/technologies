FROM python:3.10.2-slim-bullseye

ENV DEBIAN_FRONTEND noninteractive

ENV LC_ALL C
ENV LD_RUN_PATH /usr/local/lib

# LIGHT DEPENDENCIES START
RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client git apt-transport-https ca-certificates \
      krb5-user libpam-krb5 libpam-ccreds locales openjdk-11-jdk ca-certificates-java ant && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# LIGHT DEPENDENCIES END

# UPGRADE PIP
RUN pip --no-cache-dir install --upgrade pip

# Add Hadoop CLI
RUN cd / \
    && mkdir app \
    && cd app \
    && wget https://archive.apache.org/dist/hadoop/common/hadoop-2.6.5/hadoop-2.6.5.tar.gz \
    && tar xvf hadoop-2.6.5.tar.gz \
    && rm hadoop-2.6.5.tar.gz \
    && rm -rf hadoop-2.6.5/etc/hadoop \
    && ln -s /etc/hadoop/conf hadoop-2.6.5/etc/hadoop;

# Fix Locale
RUN sed -i '/^#.* en_US.* /s/^#//' /etc/locale.gen \
    && locale-gen

# Fix certificate issues
RUN update-ca-certificates -f;

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64/
ENV HADOOP_HOME=/app/hadoop-2.6.5
ENV HADOOP_CONF_DIR=/etc/hadoop/conf
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/app/hadoop-2.6.5/lib/native:/usr/lib/jvm/java-11-openjdk-amd64/lib"
ENV PATH "/app/hadoop-2.6.5/bin:${PATH}"
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
