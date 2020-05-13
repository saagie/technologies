FROM openjdk:7-jre-slim-jessie

ENV HADOOP_CONF_DIR=/etc/hadoop/conf

ENV DEBIAN_FRONTEND noninteractive

# LIGHT DEPENDENCIES START
RUN apt update -qq && apt install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client && \
    rm -rf /var/lib/apt/lists/*;
# LIGHT DEPENDENCIES END

RUN apt update -qq && apt install -yqq --no-install-recommends \
      krb5-user && \
    rm -rf /var/lib/apt/lists/*;

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
