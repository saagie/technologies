ARG base_img

FROM ${base_img} AS BASE_IMG

LABEL maintainer="Saagie"

COPY resources/requirements-bin.txt /tmp/requirements-bin.txt
RUN apt update -qq && cat /tmp/requirements-bin.txt | grep -v '# ' | xargs apt install -yqq --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*;

# Install remaining packages from source
COPY resources/requirements-src.R /tmp/requirements-src.R
RUN Rscript /tmp/requirements-src.R
