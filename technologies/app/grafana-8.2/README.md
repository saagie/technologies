<!-- # Grafana -->

![Docker Image Size (tag)](https://img.shields.io/docker/image-size/saagie/grafana/8.2.1?label=8.2.1%20image%20size&style=for-the-badge)

## How to launch Grafana?

To make Grafana work on your platform, you must meet the following requirements.

> [!IMPORTANT]
> Grafana 8.2 requires different settings than Grafana 9.0 or later.

### If you are using Grafana version `9.0` or higher:

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variable</a>:

    | Name                     | Value                                                                                                                                                        | 
    |--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `GF_SECURITY_ADMIN_PASSWORD` | This is the password of the Grafana admin user.<br/>**<u>NOTE</u>**: The default admin user login is `admin`. You can change it after your first connection. |

### If you are using Grafana version `8.2`

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variable</a>:

    | Name                     | Value                                                                                                                                                        | 
    |--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `GRAFANA_ADMIN_PASSWORD` | This is the password of the Grafana admin user.<br/>**<u>NOTE</u>**: The default admin user login is `admin`. You can change it after your first connection. |

***
> _For more information on Grafana, see the <a href="https://grafana.com/docs/grafana/latest/" target="_blank">official documentation</a>._

<!-- ## How to build the image in local?

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `grafana-x.y` folder corresponding to your version, `technologies/app/grafana-8.2/<version>`. Use the `cd` command.
2. Run the following command lines:
    ```bash
    docker build -t saagie/grafana:<version> .
    docker push saagie/grafana:<version>
    ```
    Where `<version>` must be replaced with the version number. -->
