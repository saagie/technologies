#!/bin/bash
if [ -z "$SAAGIE_BASE_PATH" ]
then
      SAAGIE_BASE_PATH=/
fi
echo ""
echo "*** Setting Saagie's custom Base Path to [$SAAGIE_BASE_PATH]"
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/nginx.conf
echo ""
echo "Starting nginx reverse proxy ..."
nginx
echo ""
echo "Starting elasticsearch ..."
/usr/local/bin/docker-entrypoint.sh
