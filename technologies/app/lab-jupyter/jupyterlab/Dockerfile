ARG PYTHON39_IMG="saagie/python:3.9-1.95.0_SDKTECHNO-101-PYTHON-3.9"

ARG BASE_CONTAINER

FROM $PYTHON39_IMG AS PYTHON39
FROM $BASE_CONTAINER

LABEL Maintainer="Saagie"

ENV DEBIAN_FRONTEND noninteractive
########################## LIBS PART BEGIN ##########################
USER root
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
    python3-pip \
      gcc \
      g++ \
      libsasl2-modules-ldap \
      build-essential \
      unixodbc \
      unixodbc-dev \
      libpq-dev \
      libsqlite3-dev \
      libkrb5-dev \
      libssl-dev \
      libcurl4-openssl-dev \
      libgeos-dev \
      swig \
      python3-matplotlib \
      python3-lxml \
      libxml2-dev libxslt1-dev  \
      sasl2-bin libsasl2-2 libsasl2-dev libsasl2-modules \
      libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*
########################## LIBS PART END ##########################

################ Kernels / Conda envs / requirements PART BEGIN ################
USER $NB_USER
SHELL ["/bin/bash", "-c"]
COPY --from=PYTHON39 /tmp/requirements.txt /home/$NB_USER/requirements_python3.txt
RUN . activate py39 \
    && python -m pip install --no-cache-dir -r /home/$NB_USER/requirements_python3.txt \
    && conda deactivate \
    && . activate py38 \
    && python -m pip install --no-cache-dir -r /home/$NB_USER/requirements_python3.txt \
    && conda deactivate \
    && conda clean -ay \
    && rm -rf ~/.cache/pip

# Updating kernels to force activating conda env whenever opening a console
ADD resources/kernel-3.8.json /home/$NB_USER/.local/share/jupyter/kernels/py38/kernel.json
ADD resources/kernel-3.9.json /home/$NB_USER/.local/share/jupyter/kernels/py39/kernel.json
ADD resources/kernel-*.sh /

################ Kernels / Conda envs / requirements PART ENDS #################

# Should run as $NB_USER  ... but ...
# USER $NB_USER
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root

# Runs Jupyter in a loop so that quitting Jupyter does not cause the container to exit.
ENV RESTARTABLE yes

# Enable JupyerLab at startup instead of Jupyter Notebook
ENV JUPYTER_ENABLE_LAB yes



