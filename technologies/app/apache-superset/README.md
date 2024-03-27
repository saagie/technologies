## How to launch Apache Superset?

To make Apache Superset work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variable</a>:

    | Name                       | Value                                                                                                                                                         | 
    |----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `SUPERSET_ADMIN_PASSWORD`  | This is the password of the Superset admin user.<br/>**<u>NOTE</u>**: The default admin user login is `admin`. You can change it after your first connection. |

> [!NOTE]
> Apache Superset does not support basic URL configuration. The app relies on `nginx` sub-filters that rewrite hard-coded URLs to HTML, such as assets. This solution works, but is not optimal, as it requires disabling GZip compression. Hard-coded URLs in JavaScript are directly replaced in the Python lib folder on startup. For more information, see the `assets/entrypoint.sh` file.

***
> _For more information on Apache Superset, see the <a href="https://superset.apache.org/docs/intro/" target="_blank">official documentation</a>._


<!-- ## How to build the image in local?

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `apache-superset-x.y` folder corresponding to your version, `technologies/app/apache-superset/<version>`. Use the `cd` command.
2. Run the following command lines:
    ```bash
    docker build -t saagie/apache-superset-<version> .
    docker push saagie/apache-superset-<version>
    ```
    Where `<version>` must be replaced with the version number. -->