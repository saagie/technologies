ARG PYTHON3_IMG="saagie/python:3.6-1.46.0"

ARG BASE_CONTAINER="saagie/jupyter-python-nbk:v2-minimal-1.63.0"

FROM $PYTHON3_IMG AS PYTHON3
FROM $BASE_CONTAINER

LABEL maintainer="Saagie"

########################## LIBS PART BEGIN ##########################
USER root
# TODO check if all necessary seems there are duplicate from jupyter/scipy image
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
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
      qt5-default libqt5webkit5-dev \
      libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*
########################## LIBS PART END ##########################

################ Kernels / Conda envs / requirements PART BEGIN ################
USER $NB_USER
SHELL ["/bin/bash", "-c"]
# Add libs for python 3.6 env
#     inherited from saagie/python:3.6 image
#     installed via pip only
#     installed via conda
COPY --from=PYTHON3 /tmp/requirements.txt /home/$NB_USER/requirements_python3.txt
COPY resources/requirements_pip3.txt /home/$NB_USER/requirements_pip3.txt
COPY resources/requirements_conda3.txt /home/$NB_USER/requirements_conda3.txt
RUN . activate py36 \
    && python -m pip install --no-cache-dir -r /home/$NB_USER/requirements_python3.txt \
    && python -m pip install --no-cache-dir -r /home/$NB_USER/requirements_pip3.txt \
    && conda deactivate \
    && conda install -n py36 --quiet --yes --file /home/$NB_USER/requirements_conda3.txt \
    && conda clean -ay \
    && rm -rf ~/.cache/pip
################ Kernels / Conda envs / requirements PART ENDS #################

########################## CUDA PART BEGIN ##########################
USER root

ENV PATH="${PATH}:/usr/local/nvidia/bin:/usr/local/cuda/bin"
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/local/nvidia/lib:/usr/local/nvidia/lib64"
# nvidia-container-runtime
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
ENV NVIDIA_REQUIRE_CUDA "cuda>=10.0 brand=tesla,driver>=384,driver<385 brand=tesla,driver>=410,driver<411"

ENV CUDA_VERSION 10.0.130
ENV CUDA_PKG_VERSION 10-0=$CUDA_VERSION-1
ENV NCCL_VERSION 2.4.2
ENV CUDNN_VERSION 7.6.0.64

LABEL com.nvidia.cudnn.version="${CUDNN_VERSION}"

ENV NVIDIA_GPGKEY_SUM=d1be581509378368edeec8c1eb2958702feedf3bc3d17011adbf24efacce4ab5
ENV NVIDIA_GPGKEY_FPR=ae09fe4bbd223a84b2ccfce3f60f4b3d7fa2af80
RUN apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub && \
    apt-key adv --export --no-emit-version -a $NVIDIA_GPGKEY_FPR | tail -n +5 > cudasign.pub && \
    echo "$NVIDIA_GPGKEY_SUM  cudasign.pub" | sha256sum -c --strict - && rm cudasign.pub && \
    echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64 /" > /etc/apt/sources.list.d/cuda.list && \
    echo "deb https://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu1604/x86_64 /" > /etc/apt/sources.list.d/nvidia-ml.list && \
    # For libraries in the cuda-compat-* package: https://docs.nvidia.com/cuda/eula/index.html#attachment-a
    apt-get update && apt-get install -y --no-install-recommends \
        cuda-cudart-$CUDA_PKG_VERSION \
        cuda-libraries-$CUDA_PKG_VERSION \
        cuda-nvtx-$CUDA_PKG_VERSION \
        cuda-compat-10-0 && \
        libnccl2=$NCCL_VERSION-1+cuda10.0 \
        libcudnn7=$CUDNN_VERSION-1+cuda10.0 \
    && apt-mark hold libnccl2 libcudnn7 \
    && ln -s cuda-10.0 /usr/local/cuda \
    && rm -rf /var/lib/apt/lists/* \
    # Path doesn't exists... here for compatibility it seems https://gitlab.com/nvidia/container-images/cuda/issues/27
    && echo "/usr/local/nvidia/lib" >> /etc/ld.so.conf.d/nvidia.conf \
    && echo "/usr/local/nvidia/lib64" >> /etc/ld.so.conf.d/nvidia.conf
########################## CUDA PART END ##########################

# Should run as $NB_USER  ... but ...
# USER $NB_USER
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root
