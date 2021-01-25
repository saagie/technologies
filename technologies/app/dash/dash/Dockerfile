FROM python:3.8-slim

RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY resources/entrypoint.sh entrypoint.sh

EXPOSE 8050

ENTRYPOINT [ "./entrypoint.sh" ]
