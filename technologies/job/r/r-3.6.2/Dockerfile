ARG base_img

FROM ${base_img} AS BASE_IMG

COPY resources/requirements-bin.txt .
RUN apt update -qq && cat requirements-bin.txt | grep -v '# ' | xargs apt install -yqq --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*;

# Install remaining packages from source
COPY resources/requirements-src.R .
RUN Rscript requirements-src.R
