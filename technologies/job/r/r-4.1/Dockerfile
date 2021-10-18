ARG base_img

FROM ${base_img} AS BASE_IMG

LABEL maintainer="Saagie"

# pre requisite as of 20201216 to install properly prophet package
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        libv8-dev libxml2-dev  \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /var/log/*

COPY resources/requirements.txt .
RUN install2.r -n `nproc --all` -e -s `cat requirements.txt | xargs`
