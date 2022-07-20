#!/bin/sh

if [[ -z "${PGADMIN_DEFAULT_EMAIL}" ]]; then
  echo 'ERROR : $PGADMIN_DEFAULT_EMAIL variable must be set before launch. Exiting.'
  exit 1
fi

if [[ -z "${PGADMIN_DEFAULT_PASSWORD}" ]]; then
  echo 'ERROR : $PGADMIN_DEFAULT_PASSWORD variable must be set before launch. Exiting.'
  exit 2
fi

echo "launching Nginx"
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/http.d/pgadmin.conf

nginx -g 'pid /tmp/nginx.pid; daemon on;' && /entrypoint.sh

