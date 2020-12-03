ARG BASE_CONTAINER="saagie/jupyter-python-nbk:v2-minimal"

FROM $BASE_CONTAINER

MAINTAINER Saagie

########################## LIBS PART BEGIN ##########################
USER root
# TODO check if all necessary seems there are duplicate from jupyter/scipy image
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      # replaces libpng3 for bionic
      libpng16-16 \
      # replaces libdal6 for bionic
      libgdal-dev \
      # needed to compile psycopg2
      libpq-dev \
      libxml2-dev libxslt1-dev antiword unrtf poppler-utils pstotext tesseract-ocr \
      flac ffmpeg lame libmad0 libsox-fmt-mp3 sox libjpeg-dev swig redis-server libpulse-dev \
      libfreetype6-dev libatlas-base-dev gfortran \
      sasl2-bin libsasl2-2 libsasl2-dev \
      libsasl2-modules unixodbc-dev python3-tk \
      qt5-default \
      libqt5webkit5-dev \
      libcurl4-openssl-dev \
      nano net-tools \
    && rm -rf /var/lib/apt/lists/*
########################## LIBS PART END ##########################

################ Kernels / Conda envs / requirements PART BEGIN ################
USER $NB_USER
SHELL ["/bin/bash", "-c"]
# Add libs for python 3.6 env
#     inherited from saagie/python:3.6 image
#     installed via pip only
#     installed via conda
COPY resources/requirements_pandas.txt /home/$NB_USER/requirements_pandas.txt
#COPY resources/requirements_pip3.txt /home/$NB_USER/requirements_pip3.txt
RUN conda install -n py36 --quiet --yes --file /home/$NB_USER/requirements_pandas.txt
#RUN . activate py36 \
#    && python -m pip install --no-cache-dir -r /home/$NB_USER/requirements_pip3.txt \
#    && conda deactivate \
#    && conda clean -ay \
#    && rm -rf ~/.cache/pip
################ Kernels / Conda envs / requirements PART ENDS #################

# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root
