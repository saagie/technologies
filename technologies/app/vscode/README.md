![Docker Image Size (tag)](https://img.shields.io/docker/image-size/saagie/vscode-server/4.8?label=v4.8%20image%20size&style=for-the-badge)

> [!NOTE]
> This Docker image is based on the <a href="https://github.com/linuxserver/docker-code-server" target="_blank">linuxserver/docker-code-server</a> Git repository.

## How to launch VS Code Server?

To make VS Code Server work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

    | Name                        | Value                                                                                                                                                                                   | 
    |-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `VSCODE_PASSWORD`           | This is the password to access your VSCode interface.                                                                                                                                   |
    | `VSCODE_HASHED_PASSWORD`    | This is to set the password to access your VSCode interface via hash. Password hashing turns your password into a short string of letters and/or numbers using an encryption algorithm. |
    | `VSCODE_SUDO_PASSWORD`      | This allows you to have sudo access in the openvscode-server terminal with the specified password.                                                                                      |
    | `VSCODE_SUDO_PASSWORD_HASH` | This is to set your sudo password via hash. Password hashing turns your password into a short string of letters and/or numbers using an encryption algorithm.                           |

****
> - _For more information on VS Code, see the <a href="https://code.visualstudio.com/docs" target="_blank">official documentation</a>._
> - _For more information on VS Code Server, see the <a href="https://code.visualstudio.com/docs/remote/vscode-server" target="_blank">official documentation</a>._


<!-- ## How to build the image in local?

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `vscode-x.y` folder corresponding to your version, `technologies/app/vscode/<version>`. Use the `cd` command.
2. Run the following command line:
    ```bash
    docker build -t saagie/vscode-server .
    ```

## How to run the image?

### On Saagie's Platform 

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the VS Code Serve configurations that you want to use.
    ```bash
    docker run --rm -it -p 8443:8443 \
    -e SAAGIE_BASE_PATH=/ \
    saagie/vscode-server
    ```
   Where:
   - Port `8443` must be mapped to the port you will use on the host side. Here, `8443`.
   - The `SAAGIE_BASE_PATH` environment variable is **mandatory**. It must be set to `/`. It is used to customize the access path to the app when it is behind a reverse proxy.
   - `saagie/vscode-server` specifies the Docker image to use, which is `saagie/vscode-server`.
2. Access your local image at `localhost:8443/`. -->