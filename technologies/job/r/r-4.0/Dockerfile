ARG base_img

FROM ${base_img} AS BASE_IMG

# Install remaining packages from source
COPY resources/requirements-src.R .
RUN Rscript requirements-src.R

COPY resources/requirements-bin.txt .
RUN apt update -qq && cat requirements-bin.txt | xargs apt install -yqq --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /var/log/*
