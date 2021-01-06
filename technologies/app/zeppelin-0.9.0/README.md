# Zeppelin Datascience Notebook

This Docker image is available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/zeppelin-nbk) and is based on the official Apache Zeppelin image: [apache/zeppelin:0.9.0](https://hub.docker.com/r/apache/zeppelin).

It is designed to run on Saagie's V2 platform.

It adds some specific library versions used on Saagie's platform (such as Spark versions).


## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin). 

To build the project, go to the root of this project.
Then run:

```
./gradlew :zeppelin-0.9.0:buildImage
```

If you want to test the image, you can run:
```
./gradlew :zeppelin-0.9.0:testImage
```

### Using docker commands

First go to context/version sub-directory:

```
cd zeppelin-0.9.0
```


Then run the following command:
```
docker build -t saagie/zeppelin:0.9.0 .
```

## Run a container

### On Saagie's Platform 

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html).

### On premise / your local server

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

If you want to run it with an in-memory Spark, run:
```
docker run -it --rm --name zeppelin -p 8080:8080 saagie/zeppelin:0.9.0
```

 If you want to run it locally but pointing to a remote Spark cluster, run:
```
docker run -it --rm --name zeppelin --net=host -e PORT0=[ZEPPELIN_PORT] \
  -v $(pwd)/notebook/:/notebook/ \
  -v $(pwd)/conf/hive/hive-site.xml:/etc/hive/conf/hive-site.xml \
  -v $(pwd)/conf/hadoop/:/etc/hadoop/conf/ \
  -v $(pwd)/conf/spark/spark-env.sh:/usr/local/spark/conf/spark-env.sh \
  -v $(pwd)/conf/spark/spark-defaults.conf:/tmp/spark-defaults.conf \
  saagie/zeppelin:0.9.0 /zeppelin/saagie-zeppelin.sh -d DEBUG --port [ZEPPELIN_PORT]
```

The given volumes contain Hive, Hadoop, and Spark configuration files of your remote cluster.
The `/notebook` volume is where Zeppelin notebooks are saved.
And the `[ZEPPELIN_PORT]` variable is the port on which to run Zeppelin
