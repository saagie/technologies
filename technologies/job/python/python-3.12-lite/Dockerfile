FROM python:3.12.4-slim-bullseye

ENV DEBIAN_FRONTEND noninteractive
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8

# INSTALL DEPENDENCIES
RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
