#!/bin/bash

echo ""
echo "*** Setting Saagie's custom Base Path to [$ORIENTDB_WEB_PATH]"
sed -i 's:PATH_REPLACE:'"$ORIENTDB_WEB_PATH"':g' /etc/nginx/nginx.conf

echo ""
echo "*** Setting Saagie's custom Base Path to [$ORIENTDB_BINARY_PATH]"
sed -i 's:PATH2_REPLACE:'"$ORIENTDB_BINARY_PATH"':g' /etc/nginx/nginx.conf

# one line to exit if nginx exits before launching the orientdb server
nginx && server.sh
