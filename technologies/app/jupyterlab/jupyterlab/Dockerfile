ARG PYTHON39_IMG
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

RUN sh -x \
    && for env in py38 py39;  \
       do \
          . activate $env \
          && python -m pip install --no-cache-dir -r /home/$NB_USER/requirements_python3.txt \
          && conda deactivate; \
       done \
    && conda clean -ay \
    && rm -rf ~/.cache/pip

################ Kernels / Conda envs / requirements PART ENDS #################

# Should run as $NB_USER  ... but ...
# USER $NB_USER
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root

# Runs Jupyter in a loop so that quitting Jupyter does not cause the container to exit.
ENV RESTARTABLE yes

# Enable JupyerLab at startup instead of Jupyter Notebook
ENV JUPYTER_ENABLE_LAB yes



