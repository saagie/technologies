> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/nifi" target="_blank">Saagie’s DockerHub</a> and is based on the official Apache NiFi Docker image, <a href="https://hub.docker.com/r/apache/nifi/" target="_blank">apache/nifi:1.9.2</a>.

## How to launch Apache NiFi?

To make Apache NiFi work on your platform, there are no special steps to take.

You can directly click **Install** to install your app.

***
> _For more information on Apache NiFi, see the <a href="https://nifi.apache.org/documentation/v2/" target="_blank">official documentation</a>._

<!-- ## How to build the image in local?

### Using the Gradle Build

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :nifi-1.9.2:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :nifi-1.9.2:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `nifi-x.y` folder corresponding to your version, `technologies/app/nifi/<version>`:
    ```bash
    cd nifi-1.9.2
    ```
2. Run the following command:
    ```bash
    docker build -t saagie/nifi-1.9.2 .
    ```

## How to run the image?

### On Saagie's Platform 

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the Apache NiFi version and configurations that you want to use.
    ```bash
    docker run --rm -it -p 10080:8080 --name nifi \
    -e SAAGIE_BASE_PATH=/ -t \
    saagie/nifi:1.9.2
    ```
   Where:
   - Port `8050` must be mapped to the port you will use on the host side. Here, `18050`.
   - The `SAAGIE_BASE_PATH` environment variable is **mandatory**. It must be set to `/`. It is used to customize the access path to the app when it is behind a reverse proxy.
   - `saagie/nifi:1.9.2` specifies the Docker image to use, which is `saagie/nifi` with version `1.9.2`. -->

<!-- ## Pending Questions
- How to manage site-to-site communication?
- How to query the API from an external location?
- How to save and persist templates? Some say they are saved in the `flow.xml.gz` file within the NiFi `conf` folder.
- How to authenticate and manage several users? -->
