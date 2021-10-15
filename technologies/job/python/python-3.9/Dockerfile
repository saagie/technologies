ARG base_img

FROM ${base_img} AS BASE_IMG

# LIBS PART BEGIN
RUN apt update -qq && apt install -qqy --no-install-recommends \
      python3-pip \
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
    # xvfb \ # What for?
     #tesseract-ocr \ # To validate
     #libtesseract-dev \ # To validate
     #qt5-default \ # What for?
     #libqt5webkit5-dev \ # What for?
     #python-pil \ #Remove DEEP LEARNING
     #leptonica-progs \ #Remove DEEP LEARNING
     #libmagickwand-dev \ #Remove DEEP LEARNING
     #libpng-dev \ #Remove DEEP LEARNING
     #libjpeg62-turbo-dev \  #Remove DEEP LEARNING
     #libtiff5-dev \  #Remove DEEP LEARNING
     #libwebp-dev \  #Remove DEEP LEARNING
     #libopenjp2-7-dev \  #Remove DEEP LEARNING
     #libgif-dev \  #Remove DEEP LEARNING
    # pulseaudio \ #Remove DEEP LEARNING
    # libpulse-dev \ #Remove DEEP LEARNING
     #lame \  #Remove DEEP LEARNING
     #ffmpeg \  #Remove DEEP LEARNING
     #flac \  #Remove DEEP LEARNING
    && rm -rf /var/lib/apt/lists/*;
# LIBS PART END

# Need to read requirements.txt file sequentially to ensure consistent installatin order (Cython needed first)
# (ConfigSace install required by auto-sklearn will fail without that before the other install)
# Keep a copy of requirements.txt for depending images (jupyter...)
COPY resources/requirements.txt /tmp/requirements.txt
RUN grep -v '^#' /tmp/requirements.txt | xargs -L 1 pip --no-cache-dir install \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip
