#!/bin/bash

if [[ -z "${GF_SECURITY_ADMIN_PASSWORD}" ]]; then
  echo "ERROR : Grafana admin password must be set through GF_SECURITY_ADMIN_PASSWORD environment variable for the first connection. Exiting."
  exit 1
fi

sed -i 's:SAAGIE_BASE_PATH:'"$GF_SERVER_DOMAIN"':g' /etc/nginx/sites-enabled/grafana.conf

nginx && /run.sh
