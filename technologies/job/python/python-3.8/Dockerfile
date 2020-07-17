ARG base_img

FROM ${base_img} AS BASE_IMG

RUN apt update -qq && apt install -qqy --no-install-recommends \
        gcc g++ \
        libkrb5-dev \
        python-matplotlib \
        python-pil tesseract-ocr libtesseract-dev \
        libgeos-dev \
        unixodbc-dev unixodbc libpq-dev libsqlite3-dev \
        libssl-dev libcurl4-openssl-dev \
        qt5-default libqt5webkit5-dev build-essential python-lxml python-pip xvfb \
        leptonica-progs libmagickwand-dev libpng-dev libjpeg62-turbo-dev libtiff5-dev libwebp-dev libopenjp2-7-dev libgif-dev \
        libsasl2-2 libsasl2-dev libsasl2-modules-ldap \
        swig pulseaudio libpulse-dev lame ffmpeg flac \
    && rm -rf /var/lib/apt/lists/*;


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
COPY resources/pre-requirements.txt /tmp/pre-requirements.txt
RUN pip --no-cache-dir install -r /tmp/pre-requirements.txt \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip

COPY resources/requirements.txt /tmp/requirements.txt
RUN pip --no-cache-dir install -r /tmp/requirements.txt \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip

RUN pip --no-cache-dir install pipdeptree pipcheck
