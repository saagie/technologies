FROM python:2.7-slim-buster

ENV DEBIAN_FRONTEND noninteractive

ENV HADOOP_CONF_DIR=/etc/hadoop/conf
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/hadoop/lib/native"
ENV LC_ALL C
ENV LD_RUN_PATH /usr/local/lib

# LIGHT DEPENDENCIES START
RUN apt update -qq && apt install -yqq --no-install-recommends \
      ftp wget curl unzip telnet openssh-client \
      krb5-user libpam-krb5 libpam-ccreds freeipa-client \
    && rm -rf /var/lib/apt/lists/*;
# LIGHT DEPENDENCIES END

RUN pip --no-cache-dir install --upgrade pip

# Fix Locale
RUN apt update -qq && apt install -qqy --no-install-recommends \
      locales -y \
    && rm -rf /var/lib/apt/lists/* \
    && sed -i '/^#.* en_US.* /s/^#//' /etc/locale.gen \
    && locale-gen
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
