ARG base_img

FROM ${base_img} AS BASE_IMG

# INSTALL AWS CLI via pip3 START
RUN apt-get update -qq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -qqy --no-install-recommends \
      apt-utils python3-setuptools python3-pip groff \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && pip3 install wheel \
    && pip3 install awscli --upgrade --user
ENV AWSCLI_HOME=/root/.local
ENV PATH=$PATH:$AWSCLI_HOME/bin
# INSTALL AWS CLI via pip3 END

#UPDATE SECURITY PACKAGE BEGIN
RUN apt-get update -qq && \
    apt-get upgrade -yqq --no-install-recommends && \
    apt-get autoremove -yqq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*;
#UPDATE SECURITY PACKAGE END

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
