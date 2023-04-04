ARG base_img

FROM ${base_img} AS BASE_IMG

# LIBS PART BEGIN
RUN apt update -qq && apt install -qqy --no-install-recommends \
      python3-pip \
      gcc \
      g++ \
      libsasl2-2 \
      libsasl2-modules-ldap \
      build-essential \
      unixodbc \
      unixodbc-dev \
      libpq-dev \
      libsqlite3-dev \
      libkrb5-dev \
      libsasl2-dev \
      libssl-dev \
      libcurl4-openssl-dev \
      libgeos-dev \
      swig \
      python3-matplotlib \
      python3-lxml \
    && rm -rf /var/lib/apt/lists/*;
# LIBS PART END

# Need to read requirements.txt file sequentially to ensure consistent installation order
COPY resources/requirements.txt /tmp/requirements.txt
RUN grep -v '^#' /tmp/requirements.txt | xargs -L 1 pip --no-cache-dir install \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip

