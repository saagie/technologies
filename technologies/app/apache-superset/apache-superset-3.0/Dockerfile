FROM apache/superset:3.0.2

USER root

RUN apt-get update \
  && apt-get install -y nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/ \
  && rm /etc/nginx/sites-enabled/default

RUN pip install mysqlclient \
    pyhive \
    psycopg2 \
    cx_Oracle \
    elasticsearch-dbapi \
    impyla \
    sqlalchemy-redshift \
    "PyAthenaJDBC>1.0.9" \
    "PyAthena>1.2.0" \
    trino \
    pymssql \
    sqlalchemy-bigquery

#To be deleted
RUN apt-get update \
  && apt-get install -y vim

ADD conf/superset_config.py /app/pythonpath/superset_config.py
ADD nginx/server.conf /etc/nginx/sites-enabled/superset.conf
ADD assets/* /app/

EXPOSE 80
ENTRYPOINT ["/app/entrypoint.sh"]

