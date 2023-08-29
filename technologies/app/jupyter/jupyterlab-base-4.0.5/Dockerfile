FROM jupyter/minimal-notebook:lab-4.0.5

LABEL Maintainer="Saagie"

ENV DEBIAN_FRONTEND noninteractive

ENV PATH="${PATH}:/home/$NB_USER/.local/bin"

# Starts by cleaning useless npm cache & other files
RUN npm cache clean --force \
    && conda clean -ay \
    && rm -rf $CONDA_DIR/share/jupyter/lab/staging

########################## LIBS PART BEGIN ##########################
USER root
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
          acl \
          apt-transport-https \
          build-essential \
          ca-certificates  \
          curl  \
          freeipa-client \
          g++ \
          gcc \
          krb5-user \
          libcurl4-openssl-dev \
          libcurl4-openssl-dev \
          libgeos-dev \
          libkrb5-dev \
          libpq-dev \
          libsasl2-modules-ldap \
          libsqlite3-dev \
          libssl-dev \
          libxml2-dev libxslt1-dev  \
          openjdk-11-jdk \
          python3-lxml \
          python3-matplotlib \
          python3-pip \
          sasl2-bin libsasl2-2 libsasl2-dev libsasl2-modules \
          swig \
          unixodbc \
          unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Add Hadoop CLI
RUN cd / \
    && mkdir app \
    && cd app \
    && wget -nv https://archive.apache.org/dist/hadoop/common/hadoop-2.6.5/hadoop-2.6.5.tar.gz \
    && tar xf hadoop-2.6.5.tar.gz \
    && rm hadoop-2.6.5.tar.gz \
    && rm -rf hadoop-2.6.5/etc/hadoop \
    && ln -s /etc/hadoop/conf hadoop-2.6.5/etc/hadoop;

########################## LIBS PART END ##########################

################ Environment variables ################
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64/
ENV HADOOP_HOME=/app/hadoop-2.6.5
ENV HADOOP_CONF_DIR=/etc/hadoop/conf
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/app/hadoop-2.6.5/lib/native:/usr/lib/jvm/java-11-openjdk-amd64/lib"
ENV PATH "/app/hadoop-2.6.5/bin:${PATH}"

################ Kernels / Conda envs / requirements PART ENDS #################

########################## NOTEBOOKS DIR ##########################
USER root
# Create default workdir (useful if no volume mounted)
RUN mkdir /notebooks-dir && chown 1000:100 /notebooks-dir
# Define default workdir
WORKDIR /notebooks-dir
########################## NOTEBOOKS DIR  END ##########################

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Should run as $NB_USER  ... but ...
# USER $NB_USER
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root

# Default: run without authentication
ENTRYPOINT ["/entrypoint.sh"]
