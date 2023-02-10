#!/bin/bash

if [[ -z ${SAAGIE_SUPERVISION_LOGIN} || -z ${SAAGIE_SUPERVISION_PASSWORD} || -z ${SAAGIE_URL} ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR]  Missing environment variables. In order to work, this app needs the following environment variables set : "
  echo "- SAAGIE_SUPERVISION_LOGIN"
  echo "- SAAGIE_SUPERVISION_PASSWORD"
  echo "- SAAGIE_URL"
  exit 1
fi

if [[ -z ${MONITORING_OPT} ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] MONITORING_OPT not set, Saagie Usage Monitoring will only monitor Saagie"
  export MONITORING_OPT="SAAGIE"
fi

if [[ -z ${SAAGIE_PLATFORM_ID} ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] SAAGIE_PLATFORM_ID not set, using platform 1 by default"
  export SAAGIE_PLATFORM_ID="1"
fi

if [[ -z ${SAAGIE_PG_HOST} ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] SAAGIE_PG_HOST not set, using local postgres"
  export SAAGIE_PG_HOST="localhost"
  export SAAGIE_PG_PORT="5432"
  export SAAGIE_PG_USER="supervision_pg_user"
  export SAAGIE_PG_PASSWORD=""
  export SAAGIE_PG_DATABASE="supervision_pg_db"
else
  if [[ -z ${SAAGIE_PG_HOST} || -z ${SAAGIE_PG_PORT} || -z ${SAAGIE_PG_USER} || -z ${SAAGIE_PG_PASSWORD} || -z ${SAAGIE_PG_DATABASE} ]]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR]  Missing environment variables. If SAAGIE_PG_HOST is set, this app needs following environment variables set : "
    echo "- SAAGIE_PG_HOST"
    echo "- SAAGIE_PG_PORT"
    echo "- SAAGIE_PG_USER"
    echo "- SAAGIE_PG_PASSWORD"
    echo "- SAAGIE_PG_DATABASE"
    exit 2
  fi
fi

arrIN=(${SAAGIE_URL//\/\// })
arrOUT=(${arrIN[1]//-/ })
export SAAGIE_REALM="${arrOUT[0]}"

echo \#!/bin/bash
{
  echo export SAAGIE_SUPERVISION_LOGIN="$SAAGIE_SUPERVISION_LOGIN"
  echo export SAAGIE_SUPERVISION_PASSWORD="$SAAGIE_SUPERVISION_PASSWORD"
  echo export SAAGIE_URL="$SAAGIE_URL"
  echo export SAAGIE_REALM="$SAAGIE_REALM"
  echo export SAAGIE_PLATFORM_ID="$SAAGIE_PLATFORM_ID"
  echo export MONITORING_OPT=$MONITORING_OPT
  echo export IP_HDFS="$IP_HDFS"
  echo export HADOOP_HOME=/hadoop/hadoop-2.6.5
  echo export SAAGIE_PG_HOST="$SAAGIE_PG_HOST"
  echo export SAAGIE_PG_PORT="$SAAGIE_PG_PORT"
  echo export SAAGIE_PG_USER="$SAAGIE_PG_USER"
  echo export SAAGIE_PG_PASSWORD="$SAAGIE_PG_PASSWORD"
  echo export SAAGIE_PG_DATABASE="$SAAGIE_PG_DATABASE"
echo python3 /app/__main__.py
} >> /app/script.sh

chmod +x /app/script.sh
PG_DATA_DIR=/var/lib/postgresql/data

if [ "$SAAGIE_PG_HOST" == "localhost" ]; then
  
  #Local database
  if [ "$(ls -A $PG_DATA_DIR)" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] PG Database already exists, skipping init"
    su postgres -c "export PATH=$PATH:/usr/lib/postgresql/12/bin && pg_ctl start -D ${PG_DATA_DIR}" > /dev/null
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Initializing PG database"
    chown postgres:postgres $PG_DATA_DIR
    chmod 777 $PG_DATA_DIR

    {
      su postgres -c "/usr/lib/postgresql/12/bin/initdb -D $PG_DATA_DIR"
      su postgres -c "export PATH=$PATH:/usr/lib/postgresql/12/bin && pg_ctl start -D $PG_DATA_DIR"
      su postgres -c 'psql --command "CREATE USER supervision_pg_user"'
      su postgres -c 'psql --command "CREATE DATABASE supervision_pg_db ENCODING \"UTF8\" TEMPLATE template0"'
      su postgres -c 'psql --command "GRANT ALL PRIVILEGES ON DATABASE supervision_pg_db to supervision_pg_user"'
      su postgres -c 'psql -U supervision_pg_user -d supervision_pg_db -f infra.sql'
    } > /dev/null
  fi

else
  #External database
  echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Create PG tables if not exists"
  export PGPASSWORD=$SAAGIE_PG_PASSWORD
  psql -h $SAAGIE_PG_HOST \
       -p $SAAGIE_PG_PORT \
       -U $SAAGIE_PG_USER \
       -d $SAAGIE_PG_DATABASE \
       -f infra.sql > /dev/null
fi

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/grafana/grafana.ini
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/grafana.conf
sed -i "s:url\::url\: $SAAGIE_PG_HOST\:$SAAGIE_PG_PORT:g" /etc/grafana/provisioning/datasources/grafana_source_monitoring.yaml
sed -i "s:password\::password\: $SAAGIE_PG_PASSWORD:g" /etc/grafana/provisioning/datasources/grafana_source_monitoring.yaml
sed -i "s:user\::user\: $SAAGIE_PG_USER:g" /etc/grafana/provisioning/datasources/grafana_source_monitoring.yaml
sed -i "s:database\::database\: $SAAGIE_PG_DATABASE:g" /etc/grafana/provisioning/datasources/grafana_source_monitoring.yaml

cp /var/lib/grafana/tmp-dashboards/saagie*.json /var/lib/grafana/dashboards/

if [ "$MONITORING_OPT" == "SAAGIE_AND_DATALAKE" ]; then
   cp /var/lib/grafana/tmp-dashboards/datalake*.json /var/lib/grafana/dashboards/
elif [ "$MONITORING_OPT" == "SAAGIE_AND_S3" ]; then
   cp /var/lib/grafana/tmp-dashboards/s3*.json /var/lib/grafana/dashboards/
fi

echo "0 * * * * /app/script.sh >> /tmp/log_cron.log 2>&1" > mycron \
&& crontab mycron \
&& rm mycron \
&& service cron start

echo "Job's starting" >> /tmp/log_cron.log

tail -f /tmp/log_cron.log &

/app/script.sh &
ttyd -p 92 bash &
nginx && /run.sh
