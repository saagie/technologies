#!/bin/bash
echo "Set Proxy"
export PROXY_DOMAIN=$SAAGIE_BASE_PATH

echo "SAAGIE_BASE_PATH"
echo $SAAGIE_BASE_PATH
echo "PROXY_DOMAIN"
echo $PROXY_DOMAIN

# /init

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/nginx.conf
nginx && /init