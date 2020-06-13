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
#LIBS PART END

# Need to read requirements.txt file sequentially to ensure consistent installatin order (Cython needed first)
# (ConfigSace install required by auto-sklearn will fail without that before the other install)
COPY resources/requirements.txt .
RUN grep -v '^#' requirements.txt | xargs -n 1 -L 1 pip --no-cache-dir install \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip
