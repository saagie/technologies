ARG base_img

FROM ${base_img} AS BASE_IMG

# LIBS PART BEGIN
RUN apt update -qq && apt install -qqy --no-install-recommends \
      gcc python-matplotlib \
      g++ unixodbc unixodbc-dev libpq-dev libsqlite3-dev \
      libkrb5-dev \
      libsasl2-2 libsasl2-dev libsasl2-modules-ldap \
      python-pil tesseract-ocr libtesseract-dev \
      leptonica-progs libmagickwand-dev libpng-dev libjpeg62-turbo-dev libtiff5-dev libwebp-dev libopenjp2-7-dev libgif-dev \
      qt5-default libqt5webkit5-dev build-essential python-lxml python-pip xvfb \
      libgeos-dev \
      swig pulseaudio libpulse-dev lame ffmpeg flac \
      libssl-dev libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*;
# LIBS PART END

# cuda/cudnn installation
ENV CUDA_MAJOR_MINOR_VERSION 10.0
ENV CUDA_VERSION $CUDA_MAJOR_MINOR_VERSION.130
ENV CUDA_PKG_VERSION 10-0=${CUDA_VERSION}-1
ENV NCCL_VERSION 2.4.8
ENV CUDNN_VERSION 7.6.5.32
ENV PATH="${PATH}:/usr/local/nvidia/bin:/usr/local/cuda/bin"
ENV LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/local/nvidia/lib:/usr/local/nvidia/lib64"
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
ENV NVIDIA_REQUIRE_CUDA "cuda>=${CUDA_MAJOR_MINOR_VERSION} brand=tesla,driver>=384,driver<385 brand=tesla,driver>=410,driver<411"

RUN curl -fsSL https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/7fa2af80.pub | apt-key add - \
    && echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64 /" > /etc/apt/sources.list.d/cuda.list \
    && echo "deb https://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu1804/x86_64 /" > /etc/apt/sources.list.d/nvidia-ml.list \
    && apt update -qq && apt install -qqy --no-install-recommends \
        cuda-cudart-$CUDA_PKG_VERSION cuda-compat-$CUDA_MAJOR_MINOR_VERSION \
    && ln -s cuda-$CUDA_MARJOR_MINOR_VERSION /usr/local/cuda \
    && echo "/usr/local/nvidia/lib" >> /etc/ld.so.conf.d/nvidia.conf \
    && echo "/usr/local/nvidia/lib64" >> /etc/ld.so.conf.d/nvidia.conf \
    && apt update -qq && apt install -qqy --no-install-recommends \
        cuda-libraries-$CUDA_PKG_VERSION \
        cuda-nvtx-$CUDA_PKG_VERSION \
        libnccl2=$NCCL_VERSION-1+cuda$CUDA_MAJOR_MINOR_VERSION \
        libcudnn7=$CUDNN_VERSION-1+cuda$CUDA_MAJOR_MINOR_VERSION \
    && apt-mark hold libnccl2 libcudnn7 \
    && rm -rf /var/lib/apt/lists/*
# End install cuda/cudnn

# Need to read requirements.txt file sequentially to ensure consistent installatin order (Cython needed first)
# (ConfigSace install required by auto-sklearn will fail without that before the other install)
# Keep a copy of requirements.txt for depending images (jupyter...)
COPY resources/requirements.txt /tmp/requirements.txt
RUN grep -v '^#' /tmp/requirements.txt | xargs -n 1 -L 1 pip --no-cache-dir install \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip
