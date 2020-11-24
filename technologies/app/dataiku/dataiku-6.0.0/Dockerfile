FROM centos:7

ARG dssVersion=6.0.0

ENV DSS_VERSION="$dssVersion" \
    DSS_DATADIR="/home/dataiku/dss" \
    DSS_PORT=10000

# Dataiku account and data dir setup
RUN useradd dataiku \
    && mkdir -p /home/dataiku ${DSS_DATADIR} \
    && chown -Rh dataiku:dataiku /home/dataiku ${DSS_DATADIR}

RUN rpm -qa gpg*

# System dependencies
RUN yum update -y \
    && yum install -y \
        epel-release \
    && yum install -y \
        file \
        zeromq-devel \
        acl \
        expat \
        git \
        nginx \
        unzip \
        zip \
        java-1.8.0-openjdk \
        python3 \
        freetype \
        libgfortran \
        libgomp \
        R-core-devel \
        libicu-devel \
        libcurl-devel \
        openssl-devel \
        libxml2-devel \
        python-devel \
        python3-devel \
    && yum clean all

# Download and extract DSS kit
RUN DSSKIT="dataiku-dss-$DSS_VERSION" \
    && cd /home/dataiku \
    && echo "+ Downloading kit" \
    && curl -OsS "https://cdn.downloads.dataiku.com/public/studio/$DSS_VERSION/$DSSKIT.tar.gz" \
    && echo "+ Extracting kit" \
    && tar xf "$DSSKIT.tar.gz" \
    && rm "$DSSKIT.tar.gz" \
    && "$DSSKIT"/scripts/install/installdir-postinstall.sh "$DSSKIT" \
    && chown -Rh dataiku:dataiku "$DSSKIT"

# Install required R packages
RUN mkdir -p /usr/local/lib/R/site-library \
    && R --slave --no-restore \
        -e "install.packages( \
            c('httr', 'RJSONIO', 'dplyr', 'curl', 'IRkernel', 'sparklyr', 'ggplot2', 'gtools', 'tidyr', 'rmarkdown', 'base64enc'), \
            '/usr/local/lib/R/site-library', \
            repos='https://cloud.r-project.org')"

# TODO remove before merge
RUN yum update -y \
    && yum remove -y nginx \
    && yum install -y \
        net-tools \
        nano \
        wget \
    && yum clean all

RUN wget 'https://github.com/openresty/echo-nginx-module/archive/v0.61.tar.gz' \
    && tar -zxvf v0.61.tar.gz \
    && wget 'http://nginx.org/download/nginx-1.16.1.tar.gz' \
    && tar -xzvf nginx-1.16.1.tar.gz \
    && cd nginx-1.16.1/ \
    && ./configure --prefix=/usr/share/nginx \
      --add-module=/echo-nginx-module-0.61 \
    && make -j2 \
    && make install

# Entry point
COPY resources/entrypoint /entrypoint
RUN chmod 755 /entrypoint

COPY resources/run.sh /home/dataiku/
RUN chmod 755 /home/dataiku/run.sh && chown dataiku /home/dataiku/run.sh

COPY resources/nginx.conf /home/dataiku/nginx-test.conf
RUN chown dataiku /home/dataiku/nginx-test.conf

WORKDIR /home/dataiku
USER dataiku

EXPOSE $DSS_PORT

ENTRYPOINT  ["bash","/entrypoint"]
