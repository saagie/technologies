#!/bin/bash

set -xe

# Set env var to backend
# TODO should contain public hostname etc
export API_BASEROUTE=${TOUCAN_HOSTNAME}${BACK_PATH}
#export TOUCAN_PUPPETEER_URL=""

# move frontend to port 88 to avoid collision with backend
sed -i 's:80:88:g' /etc/nginx/conf.d/front.conf
sed -i 's:80:89:g' /etc/nginx/nginx.conf

sed -i 's:FRONT_PATH:'$FRONT_PATH':g' /etc/nginx/conf.d/proxy.conf
sed -i 's:BACK_PATH:'$BACK_PATH':g' /etc/nginx/conf.d/proxy.conf

sed -i 's:base href="/":base href="'$FRONT_PATH'/":g' /usr/share/nginx/html/index.html

# Trick to update /etc/hosts inside a container to avoid '/etc/hosts': Device or resource busy
cp /etc/hosts /etc/hosts_tmp
sed -i 's:127\.0\.0\.1.*:127\.0\.0\.1 localhost redis mongo:g' /etc/hosts_tmp
cp /etc/hosts_tmp /etc/hosts
rm /etc/hosts_tmp

# Start Redis server
/etc/init.d/redis-server start

# Start Mongodb server
mongod --dbpath /var/lib/mongodb --logpath /var/log/mongod/mongod.log --bind_ip_all --fork

# TODO remove once dev is finished
# checks network
netstat -antlp
