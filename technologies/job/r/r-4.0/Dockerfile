ARG base_img

FROM ${base_img} AS BASE_IMG

LABEL maintainer="Saagie"

# pre requisite as of 20201216 to install properly prophet package
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        libv8-dev \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /var/log/*

# Install remaining packages from source
COPY resources/requirements-src.R /tmp/requirements-src.R
RUN Rscript /tmp/requirements-src.R

COPY resources/requirements-bin.txt /tmp/requirements-bin.txt
RUN apt update -qq && cat /tmp/requirements-bin.txt | xargs apt install -yqq --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /var/log/*
