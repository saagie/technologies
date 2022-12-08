ARG base_img

FROM ${base_img} AS BASE_IMG

ENV DEBIAN_FRONTEND noninteractive

# INSTALL AWS CLI START
RUN apt-get update -qq && apt-get install -qqy --no-install-recommends less groff \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-2.9.4.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && rm awscliv2.zip \
    && ./aws/install
# INSTALL AWS CLI END

WORKDIR /sandbox

ENTRYPOINT  ["bash","/entrypoint"]
