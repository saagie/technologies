#!/bin/bash

if [[ -z "${GRAFANA_ADMIN_PASSWORD}" ]]; then
  echo "ERROR : Grafana admin password must be set through GRAFANA_ADMIN_PASSWORD environment variable for the first connection. Exiting."
  exit 1
else
  sed -i 's:GRAFANA_ADMIN_PASSWORD:'"$GRAFANA_ADMIN_PASSWORD"':g' /etc/grafana/grafana.ini
fi

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/grafana/grafana.ini
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/grafana.conf

nginx && /run.sh
