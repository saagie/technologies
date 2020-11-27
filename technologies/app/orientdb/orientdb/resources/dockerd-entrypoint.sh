#!/bin/bash

echo ""
echo "*** Setting Saagie's custom Base Path to [$TS_PATH}"
sed -i 's:REPLACE_TS_PATH:'"$TS_PATH"':g' /etc/nginx/nginx.conf

echo ""
echo "*** Setting Saagie's custom Base Path to [$TS2_PATH}"
sed -i 's:REPLACE_TS2_PATH:'"$TS2_PATH"':g' /etc/nginx/nginx.conf

# OPTION 2 replace in place the redirect
# see Dockerfile for OPTION 1
#sed -i 's:URL=/studio:URL=studio:g' /orientdb/www/index.htm

# one line to exit if nginx exits before launching TS
nginx && server.sh
