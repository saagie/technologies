ARG base_img

FROM ${base_img} AS BASE_IMG

# INSTALL GCP CLI START
RUN apt-get update -qq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -qqy --no-install-recommends \
      apt-transport-https gnupg lsb-release \
    && export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)" \
    && echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list \
    && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - \
    && apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -qqy --no-install-recommends \
      google-cloud-sdk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
ENV GCP_HOME=/google-cloud-sdk
ENV PATH=$PATH:$GCP_HOME/bin
# INSTALL GCP CLI END

#UPDATE SECURITY PACKAGE BEGIN
RUN apt-get update -qq && \
    apt-get upgrade -yqq --no-install-recommends && \
    apt-get autoremove -yqq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*;
#UPDATE SECURITY PACKAGE END

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
