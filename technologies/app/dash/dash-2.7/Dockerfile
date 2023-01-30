FROM python:3.10-bullseye

RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        git python3-dev libpq-dev  gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

RUN pip install dash==2.7.0 \
    pandas==1.5.1 \
    psycopg2==2.9.5 \
    dash-bootstrap-components==1.2.1

COPY resources/entrypoint.sh entrypoint.sh

EXPOSE 8050

ENTRYPOINT [ "./entrypoint.sh" ]