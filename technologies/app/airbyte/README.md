![Docker Image Size (tag)](https://img.shields.io/docker/image-size/saagie/airbyte/1.0)

> [!NOTE]
> A project can create its own Airbyte connections without being seen by other projects, whereas there is only one user on the Airbyte Open-Source (OSS) version. For more details on the limitation of Airbyte OSS, see the <a href="https://docs.airbyte.com/" target="_blank">Airbyte Open Source documentation</a>.

## How to launch Airbyte?

To make Airbyte work on your platform, you must meet the following requirements.

1. Ask Saagie a VM containing Airbyte. To do so, open a ticket at the <a href="https://support.saagie.com/hc/en-us" target="_blank">Saagie Help Center</a>.
2. Once your VM has been created, you will receive the information required to  configure Airbyte in Saagie, that is, your credentials and URL of the VM you have requested. Remember them for the next step.
3. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

    | Name                     | Value                                                                                                                                                                                                                                                                                  |
    |--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `AIRBYTE_URL`            | This is the URL of the VM containing Airbyte.                                                                                                                                                                                                                                          |
    | `AIRBYTE_LOGIN`          | This is the login of the VM containing Airbyte.                                                                                                                                                                                                                                        |
    | `AIRBYTE_PASSWORD`       | This is the password of the VM containing Airbyte.                                                                                                                                                                                                                                     |
    | `SAAGIE_URL`             | This is the URL of your Saagie platform. <br/>For example, `https://saagie-workspace.prod.saagie.io`.                                                                                                                                                                                  |
    | `SAAGIE_PLATFORM_ID`     | This is the ID of your Saagie platform. The default value is `1`.                                                                                                                                                                                                                      |
    | `SAAGIE_LOGIN`           | This is the Saagie platform user login.<br/> **<u>IMPORTANT</u>**: Make sure this user have editor rights to the corresponding project, that is, the project you will be referencing for `SAAGIE_PROJECT_NAME`.                                                                        |
    | `SAAGIE_PASSWORD`        | This is the Saagie platform user password.<br/> **<u>NOTE</u>**: The user credentials referenced here and in the `SAAGIE_PASSWORD` environment variable are required for project management. Any other user who has access to the project will be able to use the Airbyte app as well. |
    | `SAAGIE_PROJECT_NAME`    | This is the name of your Saagie project.                                                                                                                                                                                                                                               |
    | `AIRBYTE_WORKSPACE_NAME` | This is the Airbyte workspace name. If not configured, it will retrieve the value of the `SAAGIE_PROJECT_NAME` environment variable.                                                                                                                                                   |
4. You can now access Airbyte in the following ways:
   - <a href="https://docs.saagie.io/user/latest/how-to/airbyte/airbyte-use-as-app-in-saagie" target="_blank">as a Saagie app</a>. 
   - <a href="https://docs.saagie.io/user/latest/how-to/airbyte/airbyte-use-as-api" target="_blank">as an API</a>.

***
> _For more information on Airbyte, see the <a href="https://docs.airbyte.com/?_gl=1*12vfeg5*_gcl_au*MTMzNzE3NDY2Mi4xNzExMTE4ODQ4" target="_blank">official documentation</a>._


<!-- ## How to build the image in local?

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `airbyte-x.y` folder corresponding to your version, `technologies/app/airbyte/<version>`. Use the `cd` command.
2. Run the following command lines:
    ```bash
    docker build -t saagie/airbyte:<version> .
    docker push saagie/airbyte:<version>
    ```
    Where `<version>` must be replaced with the version number. -->