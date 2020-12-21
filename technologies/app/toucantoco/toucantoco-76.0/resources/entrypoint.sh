#!/bin/bash

set -e

# Set env var to backend
# should contain public hostname etc
export TOUCAN_HOSTNAME="[${TOUCAN_HOST}${TOUCAN_BACK_PORT}]"
export TOUCAN_FRONTEND_URLS="[${TOUCAN_HOST}${TOUCAN_FRONT_PORT}${FRONT_PATH}]"
export API_BASEROUTE=${TOUCAN_HOST}${TOUCAN_BACK_PORT}${BACK_PATH}
#TODO  export TOUCAN_PUPPETEER_URL=""

sed -i 's:80:90:g' /etc/nginx/nginx.conf

sed -i 's:FRONT_PATH:'$FRONT_PATH':g' /etc/nginx/conf.d/proxy.conf
sed -i 's:BACK_PATH:'$BACK_PATH':g' /etc/nginx/conf.d/proxy.conf

sed -i 's:base href="/":base href="'$FRONT_PATH'/":g' /usr/share/nginx/html/index.html

# Trick to update /etc/hosts inside a container to avoid '/etc/hosts': Device or resource busy
cp /etc/hosts /etc/hosts_tmp
sed -i 's:127\.0\.0\.1.*:127\.0\.0\.1 localhost redis mongo:g' /etc/hosts_tmp
cp /etc/hosts_tmp /etc/hosts
rm /etc/hosts_tmp

chown -R toucan:toucan /app/storage
chown -R redis:redis /var/lib/redis

# Start Redis server
/etc/init.d/redis-server start

#config set stop-writes-on-bgsave-error no
# Start Mongodb server
mongod --dbpath /data --logpath /var/log/mongod/mongod.log --fork
