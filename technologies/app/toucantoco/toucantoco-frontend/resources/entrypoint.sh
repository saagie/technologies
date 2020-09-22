#!/bin/bash

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"/80':g' /usr/share/nginx/html/index.html
sed -i 's#BACKEND_URL#'"$BACKEND_URL"'#g' /usr/share/nginx/html/scripts/tc-params.js
nginx -g 'daemon off;'
