FROM saagie/python:3.9-1.109.0 AS PYTHON39
FROM saagie/vscode-server:4.8

RUN apt-get update \
    && apt-get install -qqy --no-install-recommends \
    wget \
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/

ARG NB_UID="1000"
ARG NB_GID="100"

ENV CONDA_DIR=/opt/conda \
    SHELL=/bin/bash \
    NB_UID=${NB_UID} \
    NB_GID=${NB_GID} \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8
ENV PATH="${CONDA_DIR}/bin:${PATH}"

# Install miniforge
ARG CONDA_MIRROR=https://github.com/conda-forge/miniforge/releases/latest/download

# ---- Miniforge installer ----
# Check https://github.com/conda-forge/miniforge/releases
# Package Manager and Python implementation to use (https://github.com/conda-forge/miniforge)
# We're using Mambaforge installer, possible options:
# - conda only: either Miniforge3 to use Python or Miniforge-pypy3 to use PyPy
# - conda + mamba: either Mambaforge to use Python or Mambaforge-pypy3 to use PyPy
# Installation: conda, mamba, pip
RUN set -x && \
    # Miniforge installer
    miniforge_arch=$(uname -m) && \
    miniforge_installer="Mambaforge-Linux-${miniforge_arch}.sh" && \
    wget --quiet "${CONDA_MIRROR}/${miniforge_installer}" && \
    /bin/bash "${miniforge_installer}" -f -b -p "${CONDA_DIR}" && \
    rm "${miniforge_installer}" && \
    # Conda configuration see https://conda.io/projects/conda/en/latest/configuration.html
    conda config --system --set auto_update_conda false && \
    conda config --system --set show_channel_urls true && \
    if [[ "${PYTHON_VERSION}" != "default" ]]; then mamba install --quiet --yes python="${PYTHON_VERSION}"; fi && \
    # Pin major.minor version of python
    mamba list python | grep '^python ' | tr -s ' ' | cut -d ' ' -f 1,2 >> "${CONDA_DIR}/conda-meta/pinned" && \
    # Using conda to update all packages: https://github.com/mamba-org/mamba/issues/1092
    conda update --all --quiet --yes && \
    conda clean --all -f -y && \
    fix-permissions "${CONDA_DIR}"

# Create 3 conda envs
RUN conda create -n py38 python=3.8.12 \
    && bash -c "source activate py38 && conda install notebook ipykernel -y && ipython kernel install --user --name py38  --display-name 'Python 3.8'" \
    && conda create -n py39 python=3.9.10 \
    && bash -c "source activate py39 && conda install notebook ipykernel -y && ipython kernel install --user --name py39  --display-name 'Python 3.9'" \
    && conda create -n py310 python=3.10.2 \
    && bash -c "source activate py310 && conda install notebook ipykernel -y && ipython kernel install --user --name py310  --display-name 'Python 3.10'" \
    && conda clean -ay \
    && rm -rf ~/.cache/pip \
    && fix-permissions "${CONDA_DIR}"

# Get requirements from Saagie Python image
COPY --from=PYTHON39 /tmp/requirements.txt /tmp/requirements.txt

SHELL ["/bin/bash", "-c"]

# Install requirements from Saagie Python image
RUN sh -x \
    && for env in py38 py39 py310; \
       do \
          . activate $env \
          && python -m pip install --no-cache-dir -r /tmp/requirements.txt \
          && conda deactivate; \
       done \
    && conda clean -ay \
    && rm -rf ~/.cache/pip \
    && fix-permissions "${CONDA_DIR}"


# Install Vscode Python extension
RUN /app/code-server/bin/code-server --extensions-dir /config/extensions/ --install-extension ms-python.python

# # # Change settings to run interactive code in jupyter
# COPY resources/* /config/data/User/
RUN rm /tmp/settings/settings.json
COPY resources/* /tmp/settings/

ENV CONDA_DEFAULT_ENV=py310

# Setup user env and prefix environment variables with VSCODE_
RUN conda init bash \
    && echo "conda activate py310" >> ~/.bashrc \
    && sed -i '2s|^|\
    mkdir -p /config/workspace/.vscode \n \
    cp -u /tmp/settings/project-settings.json /config/workspace/.vscode/settings.json \n \
    |' /etc/s6-overlay/s6-rc.d/svc-code-server/run
