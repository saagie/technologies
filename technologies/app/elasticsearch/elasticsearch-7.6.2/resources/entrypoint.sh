#!/bin/bash
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/elasticsearch.conf
nginx && /usr/local/bin/docker-entrypoint.sh