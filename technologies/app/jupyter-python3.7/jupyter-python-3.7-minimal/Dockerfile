# latest tag    20/12/2020 github daff4686e830a7fc0fcc95a66c4df7f88486125f 26/03/2021 docker 4d9c9bd9ced0
# focal first   28/05/2020 github a2086ce62679858ff3c01129d7043ecc4076edd7
# bionic latest 26/05/2020 github 90962703684184b7efa53ed1d0fa433692b67019
FROM jupyter/minimal-notebook:68d2d835fb16

LABEL Maintainer="Saagie"

# Declare after FROM to be usable during the build process
ARG PYTHON_KERNEL="3.7"

ENV PATH="${PATH}:/home/${NB_USER}/.local/bin"

# Starts by cleaning useless npm cache & other files
RUN npm cache clean --force \
    && conda clean -ay \
    && rm -rf "${CONDA_DIR}/share/jupyter/lab/staging"

########################## LIBS PART BEGIN ##########################
USER root
# hadolint ignore=DL3008
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
      curl \
      ca-certificates apt-transport-https gnupg-curl \
      krb5-user acl freeipa-client \
    && rm -rf /var/lib/apt/lists/*
########################## LIBS PART END ##########################

################ Kernels / Conda envs / requirements PART BEGIN ################
USER ${NB_USER}
# Uninstall python3 kernel
RUN jupyter kernelspec remove -f python3 \
# seems there's sometimesa problem with pyzmq so need to reinstall it...
    && conda create -n "py${PYTHON_KERNEL}" python="${PYTHON_KERNEL}" \
    && bash -c "source activate py${PYTHON_KERNEL} && pip uninstall pyzmq -y && pip install pyzmq && conda install notebook ipykernel -y && ipython kernel install --user --name py${PYTHON_KERNEL} --display-name 'Python ${PYTHON_KERNEL}'" \
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

COPY resources/entrypoint.sh /entrypoint
RUN chmod +x /entrypoint

# Should run as ${NB_USER}  ... but ...
# USER ${NB_USER}
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
# hadolint ignore=DL3002
USER root

# Default: run without authentication
ENTRYPOINT ["/entrypoint"]
