# Spark

## Connecting with Hive 1.1.0

Starting from Spark 3.1, you must update your command line if you want to connect to a Hive Metastore V1.1.0. 
To help you do so, Hive jars for version 1.1.0 have been already downloaded inside the Saagie Spark docker images under the `/opt/spark/hive_1.1.0_jars` directory.
To load these jars in your classpath, simply add the following parameters in your Spark job command line : 

```
spark-submit \
...
--conf spark.sql.hive.metastore.jars=path \
--conf spark.sql.hive.metastore.jars.path=file:///opt/spark/hive_1.1.0_jars/*.jar \
--conf spark.sql.hive.metastore.version=1.1.0 \
--conf spark.sql.catalogImplementation=hive
... 
```

