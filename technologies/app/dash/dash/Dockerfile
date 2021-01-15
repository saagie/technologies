FROM python:3.8

WORKDIR /code

COPY resources/entrypoint.sh entrypoint.sh

RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        git \
    && rm -rf /var/lib/apt/lists/* \
    && chmod +x entrypoint.sh

EXPOSE 8050

ENTRYPOINT [ "./entrypoint.sh" ]
