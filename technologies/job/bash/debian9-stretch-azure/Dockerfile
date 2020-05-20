ARG base_img

FROM ${base_img} AS BASE_IMG

# INSTALL Azure CLI START
RUN apt-get update -qq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -qqy --no-install-recommends \
      apt-transport-https gnupg lsb-release \
    && AZ_REPO=$(lsb_release -cs) \
        && curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/microsoft.asc.gpg > /dev/null \
        && echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | tee /etc/apt/sources.list.d/azure-cli.list \
    && apt-get update -qq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -qqy --no-install-recommends \
      azure-cli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# INSTALL Azure CLI END

#UPDATE SECURITY PACKAGE BEGIN
RUN apt-get update -qq && \
    apt-get upgrade -yqq --no-install-recommends && \
    apt-get autoremove -yqq && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*;
#UPDATE SECURITY PACKAGE END

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
