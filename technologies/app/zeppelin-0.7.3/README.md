# Zeppelin Datascience Notebook

This Docker image is based on official Apache Zeppelin image.
It adds some specific library versions used on Saagie's platform (such as Spark versions, etc.)

## Build the image

Run the following command:
```
docker build -t saagie/zeppelin:sp[saagie-platform-min-version]-mesos[mesos-version]-spark[spark-version] .
```

Where you need to provide:
- the minimum Saagie platform version with which this Zeppelin image is compatible.
- the mesos version currently running on your Saagie platform
- the most recent spark version available on your Saagie platform


## Run a container

This container can run without any configuration on Saagie's platform.

If you want to run it with an in-memory Spark, just run:
```
docker run -it --rm --name zeppelin -p 8080:8080 saagie/zeppelin:sp1.12.1-mesos1.3.1-spark2.1.0
```

 If you want to run it locally but pointing to a remote Spark cluster, run:
```
docker run -it --rm --name zeppelin --net=host -e PORT0=[ZEPPELIN_PORT] \
  -v $(pwd)/notebook/:/notebook/ \
  -v $(pwd)/conf/hive/hive-site.xml:/etc/hive/conf/hive-site.xml \
  -v $(pwd)/conf/hadoop/:/etc/hadoop/conf/ \
  -v $(pwd)/conf/spark/spark-env.sh:/usr/local/spark/conf/spark-env.sh \
  -v $(pwd)/conf/spark/spark-defaults.conf:/tmp/spark-defaults.conf \
  saagie/zeppelin:sp1.12.1-mesos1.3.1-spark2.1.0 /zeppelin/saagie-zeppelin.sh -d DEBUG --port [ZEPPELIN_PORT]
```

The given volumes contain Hive, Hadoop, and Spark configuration files of your remote cluster.
The `/notebook` volume is where Zeppelin notebooks are saved.
And the `[ZEPPELIN_PORT]` variable is the port on which to run Zeppelin
