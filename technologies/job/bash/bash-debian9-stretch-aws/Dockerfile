ARG base_img

FROM ${base_img} AS BASE_IMG

# INSTALL AWS CLI via pip3 START
RUN apt-get update -qq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -qqy --no-install-recommends \
      apt-utils python3-setuptools python3-pip groff \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 --no-cache-dir install wheel \
    && pip3 --no-cache-dir install awscli --upgrade --user \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip
ENV AWSCLI_HOME=/root/.local
ENV PATH=$PATH:$AWSCLI_HOME/bin
# INSTALL AWS CLI via pip3 END

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
