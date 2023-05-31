#!/bin/bash
set -eo pipefail

if [[ -z ${SAAGIE_LOGIN} || -z ${SAAGIE_PASSWORD} || -z ${SAAGIE_URL} || -z ${AIRBYTE_LOGIN} || -z ${AIRBYTE_PASSWORD} || -z ${AIRBYTE_URL} || -z ${SAAGIE_PROJECT_NAME} ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR]  Missing environment variables. In order to work, this app needs the following environment variables set : "
  echo "- SAAGIE_LOGIN"
  echo "- SAAGIE_PASSWORD"
  echo "- SAAGIE_URL"
  echo "- SAAGIE_PROJECT_NAME"
  echo "- AIRBYTE_LOGIN"
  echo "- AIRBYTE_PASSWORD"
  echo "- AIRBYTE_URL"
  exit 1
fi

if [[ -z ${SAAGIE_PLATFORM_ID} ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] SAAGIE_PLATFORM_ID not set, using platform 1 by default"
  export SAAGIE_PLATFORM_ID="1"
fi

if [[ -z ${AIRBYTE_WORKSPACE_NAME} ]]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] AIRBYTE_WORKSPACE_NAME not set, using the name of project by default"
  export SAAGIE_PLATFORM_ID="1"
fi

arrIN=(${SAAGIE_URL//\/\// })
arrOUT=(${arrIN[1]//-/ })
export SAAGIE_REALM="${arrOUT[0]}"

echo \#!/bin/bash
{
  echo export SAAGIE_LOGIN="$SAAGIE_LOGIN"
  echo export SAAGIE_PASSWORD=\'"$SAAGIE_PASSWORD"\'
  echo export SAAGIE_URL="$SAAGIE_URL"
  echo export SAAGIE_REALM="$SAAGIE_REALM"
  echo export SAAGIE_PROJECT_NAME=\'"$SAAGIE_PROJECT_NAME"\'
  echo export AIRBYTE_LOGIN="$AIRBYTE_LOGIN"
  echo export AIRBYTE_PASSWORD="$AIRBYTE_PASSWORD"
  echo export AIRBYTE_URL="$AIRBYTE_URL"
echo python3 /app/__main__.py
} >> /app/script.sh

chmod +x /app/script.sh

sed -i 's:PASSWORD:'"$AIRBYTE_PASSWORD"':g' /etc/nginx/auth.htpasswd
sed -i 's:LOGIN:'"$AIRBYTE_LOGIN"':g' /etc/nginx/auth.htpasswd


/app/script.sh
export AIRBYTE_WORKSPACE_URL="$(cat '/tmp/airbyte_url_workspace.txt')"
sed -i 's|AIRBYTE_PATH|'"$AIRBYTE_WORKSPACE_URL"'|g' /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"