#!/bin/bash
set -eo pipefail


if [[ -z "${SUPERSET_ADMIN_PASSWORD}" ]]; then
  echo "ERROR : Superset admin password must be set through SUPERSET_ADMIN_PASSWORD environment variable. Exiting."
  exit 1
fi

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/superset.conf

#Hack to deal with hardcoded urls in Superset (such as static reference to assets...)
echo "Rewriting url based on Saagie Base Path"
python /app/replace_url.py

nginx&

# Init superset DB and creates Admin user at first startup
if [ -e $SUPERSET_HOME/superset.db ]
then
    echo "Superset Database already exists"
else
    echo "Superset Database does not exists, initalization in progress"
    superset db upgrade

    superset fab create-user \
    --role Admin \
    --username admin \
    --firstname admin \
    --lastname admin \
    --email user@example.com \
    --password ${SUPERSET_ADMIN_PASSWORD}

    superset init
fi

# Start gunicorn
if [ "${#}" -ne 0 ]; then
    exec "${@}"
else
    gunicorn \
        --bind  "0.0.0.0:${SUPERSET_PORT}" \
        --workers 1 \
        --worker-class gthread \
        --threads 20 \
        --timeout ${GUNICORN_TIMEOUT:-60} \
        --limit-request-line 0 \
        --limit-request-field_size 0 \
        "${FLASK_APP}"
fi