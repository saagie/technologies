# Spark History Server

## Description
This directory contains version of Spark History Server contenairized and customized for Saagie Platform.
See History Server official documentation for more information https://spark.apache.org/docs/latest/monitoring.html#viewing-after-the-fact

## How to build in local

Inside the `spark-history-server` folder, run :
```
docker build -t saagie/spark-history-server:<tag> .
docker push saagie/spark-history-server-<tag>
```

## Job/App specific information

Set the **SPARK_HISTORY_EVENT_LOG_DIR** environment varaible to customize the Spark logs directory (default value = `hdfs://cluster/tmp/spark-events`)