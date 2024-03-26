> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/dash" target="_blank">Saagie’s DockerHub</a> and is based on the official Python Docker image, <a href="https://hub.docker.com/_/python" target="_blank">python:3.8-slim</a>.

## How to launch Dash?

To make Dash work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

   | Name                      | Value                                                                    | 
   |---------------------------|--------------------------------------------------------------------------|
   | `DASH_GIT_URL_REPOSITORY` | This is the URL of the Git repository from which Dash is to be deployed. |
   | `DASH_GIT_BRANCH`         | This is the Git branch to checkout.<br/>For example, `master`.           |

   This will automatically checkout the Git project and Git branch specified in the environment variables when installing the app.
2. Verify that the `app.py` file of your Dash app have the `host` parameter set to `0.0.0.0`. This tells your operating system to listen on all network interfaces, including your LAN.
    ```
    if __name__ == "__main__":
        app.run_server(debug=True, host='0.0.0.0')
    ```
***
> _For more information on Dash, see the <a href="https://www.dash.org/documentation/" target="_blank">official documentation</a>._


<!-- ## How to build the image in local?

### Using the Gradle Build 

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :dash:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :dash:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `dash-x.y` folder corresponding to your version, `technologies/app/dash/<version>`:
    ```bash
    cd dash-2.0
    ```
2. Run the following command:
    ```bash
    docker build -t saagie/dash:2.0.0 .
    ```

## How to run the image?

### On Saagie's Platform

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the Dash version and configurations that you want to use.
    ```bash
    docker run --rm -it -p 18050:8050 --name dash \
    -e SAAGIE_BASE_PATH=/ \
    -e DASH_GIT_URL_REPOSITORY=git@github.com:user/repo.git \
    saagie/dash:2.0.0
    ```
   Where:
   - Port `8050` must be mapped to the port you will use on the host side. Here, `18050`.
   - The `SAAGIE_BASE_PATH` environment variable is **mandatory**. It must be set to `/`. It is used to customize the access path to the app when it is behind a reverse proxy.
   - The `DASH_GIT_URL_REPOSITORY` environment variable is **mandatory**. It must be set to the name of the Git repository that contains the source code for your Dash app.
   - The `DASH_GIT_BRANCH` environment variable is **optional** and defaults to `master`. You can add it to specify a branch to checkout. -->