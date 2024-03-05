> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/orientdb" target="_blank">Saagie’s DockerHub</a> and is based on the <a href="https://hub.docker.com/_/openjdk" target="_blank">official OpenJDK Docker image</a>.

## How to launch OrientDB?

To make OrientDB work on your platform, there are no special steps to take.

You can directly click **Install** to install your app.

> [!TIP]
> If you need persistence, the volume must have at least 256Mb of space.

***
> _For more information on OrientDB, see the <a href="http://orientdb.org/docs/3.0.x/" target="_blank">official documentation</a>._

<!-- ## How to build the image in local?

### Using the Gradle Build

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :<version>:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :<version>:testImage
    ```
Where `<version>` must be replaced with the version number.

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `orientdb-x.y` folder corresponding to your version, `technologies/app/orientdb/<version>`. Use the `cd` command.
2. Run the following command:
    ```bash
    docker build -t saagie/<version> .
    ```
Where `<version>` must be replaced with the version number.

## How to run the image?

### On Saagie's Platform 

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the OrientDB version and configurations that you want to use.
    ```bash
    docker run -it --rm --name orientdb -p 19480:9480 -p 19424:9424 \
    -e ORIENTDB_WEB_PATH=/http \
    -e ORIENTDB_BINARY_PATH=/binary \
    -e ORIENTDB_ROOT_PASSWORD=yourPassword \
    saagie/orientdb:3.1.7-1.77.0_apporientdb
    ```
   Where:
   - Port `9480` must be mapped to the port you will use on the host side for web access. Here, `19480`.
   - Port `9424` must be mapped to the port you will use on the host side for binary communication. Here, `19424`.
   - The `ORIENTDB_WEB_PATH` environment variable is **mandatory**. It defines a specific path for web access. It can be set to `/`, which is used to customize the access path to the app when it is behind a reverse proxy.
   - The `ORIENTDB_BINARY_PATH` environment variable is **mandatory**. It defines a specific path for binary communication. It can be set to `/`, which is used to customize the access path to the app when it is behind a reverse proxy.
   - The `ORIENTDB_ROOT_PASSWORD` environment variable is **mandatory**. Its value must be the password you will use to access OrientDB. Here, `yourPassword`.
   - `saagie/orientdb:3.1.7-1.77.0_apporientdb` specifies the Docker image to use, which is `saagie/orientdb` with version `3.1.7-1.77.0_apporientdb`.

> [!NOTE]
> - Databases are stored in the `/orientdb/databases` folder.
> - Configuration are stored in the `/orientdb/config` folder.
> - Logs are stored in the `/orientdb/log` folder.
> 
> You can configure persistence to better suit your needs. -->