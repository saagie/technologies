## How to launch pgAdmin 4?

To make pgAdmin 4 work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

    | Name                       | Value                                       | 
    |----------------------------|---------------------------------------------|
    | `$PGADMIN_DEFAULT_EMAIL`   | This is the default user for pgAdmin 4.     |
    | `$PGADMIN_DEFAULT_PASSWORD` | This is the default password for pgAdmin 4. |

***
> _For more information on pgAdmin 4, see the <a href="https://www.pgadmin.org/docs/pgadmin4/latest/index.html" target="_blank">official documentation</a>._

<!-- ## How to run the image?

You can run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the pgAdmin 4 configurations that you want to use.
    ```bash
    docker run -p 81:80 \
    -e PGADMIN_DEFAULT_EMAIL=user@my_mail.com \
    -e PGADMIN_DEFAULT_PASSWORD=password \
    -e SAAGIE_BASE_PATH="/baseurl" \
    saagie/pgadmin4
    ```
   Where:
   - The `PGADMIN_DEFAULT_EMAIL` environment variable is set to `user@my_mail.com`. This is the default email for pgAdmin 4.
   - The `PGADMIN_DEFAULT_PASSWORD` environment variable is set to `password`. This is the default password for pgAdmin 4.
   - The `SAAGIE_BASE_PATH` environment variable is set to `/baseurl`. This is the base URL path prefix for pgAdmin 4.
   - `saagie/pgadmin4` specifies the Docker image to use, which is `saagie/pgadmin4`.
2. For Saagie deployement, you must uncheck the **Use rewrite url** option. -->


