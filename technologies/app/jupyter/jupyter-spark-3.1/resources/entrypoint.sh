#!/bin/bash
chown -R jovyan /notebooks-dir

#Copy Hive Conf in Spark Conf Dir at runtime
cp /etc/hive/conf/hive-site.xml ${SPARK_HOME}/conf

sed -i 's:SPARK_UI_PATH:'$SPARK_UI_PATH':g' /etc/nginx/sites-available/default
nginx
start-notebook.sh --KernelSpecManager.ensure_native_kernel=False --ServerApp.token='' --ServerApp.password='' --ServerApp.base_url=$SAAGIE_BASE_PATH
