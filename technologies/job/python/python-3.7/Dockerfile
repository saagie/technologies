ARG base_img

FROM ${base_img} AS BASE_IMG

# LIBS PART BEGIN
RUN apt update -qq && apt install -qqy --no-install-recommends \
      gcc python3-matplotlib \
      g++ unixodbc unixodbc-dev libpq-dev libsqlite3-dev \
      libkrb5-dev \
      libsasl2-2 libsasl2-dev libsasl2-modules-ldap \
      python3-pil tesseract-ocr libtesseract-dev \
      leptonica-progs libmagickwand-dev libpng-dev libjpeg62-turbo-dev libtiff5-dev libwebp-dev libopenjp2-7-dev libgif-dev \
      build-essential python3-lxml python3-pip xvfb \
      libgeos-dev \
      qtbase5-dev qt5-qmake qtbase5-dev-tools libqtwebkit-dev swig pulseaudio libpulse-dev lame ffmpeg flac \
      libssl-dev libcurl4-openssl-dev libhdf5-dev gfortran libopenblas-dev liblapack-dev \
    && rm -rf /var/lib/apt/lists/*;
# LIBS PART END


# Need to read requirements.txt file sequentially to ensure consistent installatin order (Cython needed first)
# (ConfigSace install required by auto-sklearn will fail without that before the other install)
# Keep a copy of requirements.txt for depending images (jupyter...)
COPY resources/requirements.txt /tmp/requirements.txt
RUN grep -v '^#' /tmp/requirements.txt | xargs -n 1 -L 1 pip --no-cache-dir install \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip
