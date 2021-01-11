#!/bin/bash
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/cloudbeaver.conf
nginx && /opt/cloudbeaver/run-server.sh