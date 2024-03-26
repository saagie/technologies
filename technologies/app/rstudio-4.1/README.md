## How to launch RStudio?

To make RStudio work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

    | Name                      | Value                                                               | 
    |---------------------------|---------------------------------------------------------------------|
    | `$RSTUDIO_ADMIN_PASSWORD` | This is the password of the `admin` user, who has root permissions. |
    | `$RSTUDIO_PASSWORD`       | This is the password of the `rstudio` user.                         |

***
> _For more information on creating new RStudio user, see Saagie’s documentation on how to <a href="https://docs.saagie.io/user/latest/how-to/notebooks/rstudio-user-accounts-creation" target="_blank">create RStudio user accounts</a>._

<!-- ## How to build the image in local?

### Using the Gradle Build

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :rstudio-4.1:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :rstudio-4.1:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `rstudio-x.y` folder corresponding to your version, `technologies/app/rstudio/rstudio-4.1`. Use the `cd` command.
2. Run the following command:
    ```bash
    docker build -t saagie/rstudio-4.1 .
    ```
-->