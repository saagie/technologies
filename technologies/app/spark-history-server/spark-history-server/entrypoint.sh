#!/usr/bin/env bash
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/conf.d/server.conf

if [[ -z "${SPARK_HISTORY_EVENT_LOG_DIR}" ]]; then
  echo "INFO: SPARK_HISTORY_EVENT_LOG_DIR is not set in Saagie environment variables, using the default directory hdfs://cluster/tmp/spark-events"
  logDirectory='hdfs://cluster/tmp/spark-events'
else
  logDirectory="${SPARK_HISTORY_EVENT_LOG_DIR}"
fi

export SPARK_HISTORY_OPTS='-Dspark.ui.proxyBase='"$SAAGIE_BASE_PATH"' -Dspark.history.fs.logDirectory='"$logDirectory"
nginx && /opt/spark/sbin/start-history-server.sh

