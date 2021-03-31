ARG base_img

FROM ${base_img} AS BASE_IMG

LABEL maintainer="Saagie <yann.petit@saagie.com>"

# pre requisite as of 20201216 to install properly prophet package
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        libv8-dev \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /var/log/*

# Copy list of packages to install
COPY resources/requirements.txt /tmp/requirements.txt
# Add r-cran- to lib names in a new file r-cran-requirements.txt
# Then search for those libs Packages in apt-cache for repo ppa c2d4u for R 4.0+
# Create a new file r-cran-requirements-bin.txt with the lib found - clean the file to only keep the lib names
# Install those binaries
# Get list of not installed libs and
# Remove the r-cran- prefix from lib names and use the resulting list to remove those already install libs from the list
# Install remaining libs from sources
SHELL ["/bin/bash", "-c"]
ENV RCRAN_REPO "c2d4u3.5"
RUN apt-get update -qq \
    && sed -e 's/^/r-cran-/g' /tmp/requirements.txt > /tmp/r-cran-requirements.txt \
    && cat /tmp/r-cran-requirements.txt | sort | xargs apt-cache madison | grep ${RCRAN_REPO} | grep Packages > /tmp/r-cran-requirements-bin.txt \
    && sed -i -e 's/|.*$//g' -e 's/^ //g' -e 's/ $//g' /tmp/r-cran-requirements-bin.txt \
    && cat /tmp/r-cran-requirements-bin.txt | xargs apt-get install -y --no-install-recommends > /tmp/r-cran-install.log || true \
    && cat /tmp/r-cran-install.log | grep "but it is not going to be installed" > /tmp/r-cran-requirements-bin-notinstalled.txt \
    && sed -i -e 's/^ //g' -e 's/ :.*$//g' /tmp/r-cran-requirements-bin-notinstalled.txt \
    && comm -3 <(cat /tmp/r-cran-requirements-bin.txt) <(cat /tmp/r-cran-requirements-bin-notinstalled.txt) > /tmp/r-cran-requirements-bin-installed.txt \
    && cat /tmp/r-cran-requirements-bin-installed.txt | xargs apt-get install -y --no-install-recommends \
    && sed 's/^r-cran-//g' /tmp/r-cran-requirements-bin-installed.txt > /tmp/requirements-bin-installed.txt \
    && comm -3 <(cat /tmp/requirements.txt | sort) <(cat /tmp/requirements-bin-installed.txt) > /tmp/requirements-src.txt \
    && Rscript -e 'options(Ncpus = 8); install.packages(scan("/tmp/requirements-src.txt", what="", sep="\n"))' \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /var/log/*
