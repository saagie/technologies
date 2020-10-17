#!/bin/bash

set -xe

sed -i 's:80:88:g' /etc/nginx/conf.d/front.conf
sed -i 's:^bind:#bind:g' /etc/redis/redis.conf

# Trick to update /etc/hosts inside a container to avoid '/etc/hosts': Device or resource busy
cp /etc/hosts /etc/hosts_tmp
sed -i 's:127\.0\.0\.1.*:127\.0\.0\.1 localhost redis mongo:g' /etc/hosts_tmp
cp /etc/hosts_tmp /etc/hosts
rm /etc/hosts_tmp


/etc/init.d/redis-server start
mongod --dbpath /var/lib/mongodb --logpath /var/log/mongod/mongod.log --bind_ip_all --fork

netstat -antlp
