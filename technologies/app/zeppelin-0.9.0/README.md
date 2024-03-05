> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/zeppelin-nbk" target="_blank">Saagie’s DockerHub</a> and is based on the official Apache Zeppelin Docker image, <a href="https://hub.docker.com/r/apache/zeppelin" target="_blank">apache/zeppelin:0.9.0</a>. This image adds some specific versions of the library that are used on the Saagie platform, such as Spark versions.

## How to build the image in local?

### Using the Gradle Build

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :zeppelin-0.9.0:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :zeppelin-0.9.0:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `zeppelin-x.y` folder corresponding to your version, `technologies/app/zeppelin/<version>`:
    ```bash
    cd zeppelin-0.9.0
    ```
2. Run the following command:
    ```bash
    docker build -t saagie/zeppelin:0.9.0 .
    ```

## How to run the image?

### On Saagie's Platform 

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

#### With in-memory Spark

1. Run the following command. It will launch a Docker container with the Apache Zeppelin configurations that you want to use.
    ```bash
    docker run -it --rm --name zeppelin -p 8080:8080 saagie/zeppelin:0.9.0
    ```
   Where:
   - Port `8080` must be mapped to the port you will use on the host side. Here, `8080`.
   - `saagie/zeppelin:0.9.0` specifies the Docker image to use, which is `saagie/zeppelin` with version `0.9.0`.
2. Access your local image at `http://localhost:8080` from your web browser.

#### To a remote Spark cluster

1. Run the following command. It will launch a Docker container with the Apache Zeppelin configurations that you want to use.
    ```bash
    docker run -it --rm --name zeppelin --net=host -e PORT0=[ZEPPELIN_PORT] \
    -v $(pwd)/notebook/:/notebook/ \
    -v $(pwd)/conf/hive/hive-site.xml:/etc/hive/conf/hive-site.xml \
    -v $(pwd)/conf/hadoop/:/etc/hadoop/conf/ \
    -v $(pwd)/conf/spark/spark-env.sh:/usr/local/spark/conf/spark-env.sh \
    -v $(pwd)/conf/spark/spark-defaults.conf:/tmp/spark-defaults.conf \
    saagie/zeppelin:0.9.0 /zeppelin/saagie-zeppelin.sh -d DEBUG --port [ZEPPELIN_PORT]
    ```
   Where:
   - The `PORT0` environment variable is set to `[ZEPPELIN_PORT]`, which is the port on which to run Zeppelin.
   - `-v $(pwd)/notebook/:/notebook/` allows Zeppelin to access notebooks stored on the host machine.
   - The given volumes contain the Hive, Hadoop, and Spark configuration files of your remote cluster.
   - `saagie/zeppelin:0.9.0` specifies the Docker image to use, which is `saagie/zeppelin` with version `0.9.0`.
   - `[ZEPPELIN_PORT]` must be replaced with the actual port number.