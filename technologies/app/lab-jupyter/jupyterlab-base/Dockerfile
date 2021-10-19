FROM jupyter/minimal-notebook:ubuntu-20.04

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
      curl openjdk-11-jdk \
      ca-certificates apt-transport-https \
      krb5-user acl freeipa-client \
    && rm -rf /var/lib/apt/lists/*

# Add Hadoop CLI
RUN cd / \
    && mkdir app \
    && cd app \
    && wget https://archive.apache.org/dist/hadoop/common/hadoop-2.6.5/hadoop-2.6.5.tar.gz \
    && tar xvf hadoop-2.6.5.tar.gz \
    && rm hadoop-2.6.5.tar.gz \
    && rm -rf hadoop-2.6.5/etc/hadoop \
    && ln -s /etc/hadoop/conf hadoop-2.6.5/etc/hadoop;

########################## LIBS PART END ##########################

################ Environment variables ################
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64/
ENV HADOOP_HOME=/app/hadoop-2.6.5
ENV HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop-2.6.5
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/app/hadoop-2.6.5/lib/native:/usr/lib/jvm/java-11-openjdk-amd64/lib"
ENV CLASSPATH="/etc/hadoop/conf:/app/hadoop-2.6.5/share/hadoop/common/lib/*:/app/hadoop-2.6.5/share/hadoop/common/*:/app/hadoop-2.6.5/share/hadoop/hdfs:/app/hadoop-2.6.5/share/hadoop/hdfs/lib/*:/app/hadoop-2.6.5/share/hadoop/hdfs/*:/app/hadoop-2.6.5/share/hadoop/yarn/lib/*:/app/hadoop-2.6.5/share/hadoop/yarn/*:/app/hadoop-2.6.5/share/hadoop/mapreduce/lib/*:/app/hadoop-2.6.5/share/hadoop/mapreduce/*"
ENV PATH "/app/hadoop-2.6.5/bin:${PATH}"

################ Kernels / Conda envs / requirements PART BEGIN ################
USER $NB_USER
# Uninstall python3 kernel
RUN jupyter kernelspec remove -f python3

# Update conda to latest version and install jupyterlab-git plugin
RUN conda update -n root conda \
    && conda install -c conda-forge jupyterlab jupyterlab-git \
    && conda clean -ay

RUN conda create -n py38 python=3.8.10 \
    && bash -c "source activate py38 && conda install notebook ipykernel -y && ipython kernel install --user --name py38  --display-name 'Python 3.8'" \
    && conda create -n py39 python=3.9.7 \
    && bash -c "source activate py39 && conda install notebook ipykernel -y && ipython kernel install --user --name py39  --display-name 'Python 3.9'" \
    && conda clean -ay \
    && rm -rf ~/.cache/pip
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
