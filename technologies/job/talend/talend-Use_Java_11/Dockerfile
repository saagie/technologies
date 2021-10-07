FROM openjdk:11-jre-slim-buster

ENV HADOOP_CONF_DIR=/etc/hadoop/conf

ENV DEBIAN_FRONTEND noninteractive

# LIGHT DEPENDENCIES START
RUN apt update -qq && apt install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client krb5-user && \
    rm -rf /var/lib/apt/lists/*
# LIGHT DEPENDENCIES END

ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
