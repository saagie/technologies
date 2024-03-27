> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/rstudio" target="_blank">Saagie’s DockerHub</a> and is based on the official Docker image, <a href="https://hub.docker.com/r/rocker/tidyverse/" target="_blank">rocker/tidyverse:3.6.2</a>.

This image adds some new features, such as:
* [sparklyr](https://spark.rstudio.com/index.html): The possibility to connect to [Spark](http://spark.apache.org/) from R.
* [Saagie Add-in](https://github.com/saagie/rstudio-saagie-addin): The possibility to push R jobs to Saagie’s platform.
* The creation of multiple user accounts.
* Multiple libs, making this image quite heavy. For more information, see the list below.

## How to launch RStudio?

To make RStudio work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

    | Name                      | Value                                                               | 
    |---------------------------|---------------------------------------------------------------------|
    | `$RSTUDIO_ADMIN_PASSWORD` | This is the password of the `admin` user, who has root permissions. |
    | `$RSTUDIO_PASSWORD`       | This is the password of the `rstudio` user.                         |

<details>

<summary>List of additional libs</summary>

     - ade4
     - argparse
     - arules
     - arulesSequences
     - AUC
     - breakpoint
     - betareg
     - cairoDevice', INSTALL_opts='--no-test-load
     - caret
     - caretEnsemble
     - cartography
     - changepoint
     - classInt
     - cluster
     - colorspace
     - colourpicker
     - corrplot
     - curl
     - d3heatmap
     - data.table
     - dbscan
     - DescTools
     - doParallel
     - doSNOW
     - dtplyr
     - dtw
     - dummies
     - dygraphs
     - e1071
     - factoextra
     - FactoInvestigate
     - FactoMineR
     - Factoshiny
     - ff
     - ffbase
     - FNN
     - forecast
     - futile.logger
     - ggplot2
     - glmnet
     - h2o
     - hunspell
     - implyr
     - jsonlite
     - kernlab
     - kknn
     - knitr
     - kohonen
     - labeling
     - LDAvis
     - leaflet
     - leaps
     - lsa
     - magrittr
     - mapproj
     - maps
     - maptools
     - markdown
     - mclust
     - missMDA
     - mlogit
     - mvoutlier
     - networkD3
     - odbc
     - packrat
     - plotly
     - pls
     - pROC
     - prophet
     - proxy
     - pvclust
     - randomForest
     - rattle
     - RcmdrMisc
     - RColorBrewer
     - Rcpp
     - readr
     - readxl
     - recommenderlab
     - reshape2
     - rJava
     - RJDBC
     - rjson
     - RMySQL
     - ROCR
     - ROSE
     - rpart
     - rpart.plot
     - RSelenium
     - rsparkling
     - Rtsne
     - rvest
     - RWeka
     - sas7bdat
     - scales
     - shiny
     - shinydashboard
     - shinyjs
     - shinythemes
     - skmeans
     - SnowballC
     - sp
     - sparklyr
     - sqldf
     - stringi
     - stringr
     - syuzhet
     - tm
     - topicmodels
     - trend
     - TSclust
     - tseries
     - tree
     - wordcloud
     - xgboost
     - xlsx
     - xts
</details>

***
> _For more information on creating new RStudio user, see Saagie’s documentation on how to <a href="https://docs.saagie.io/user/latest/how-to/notebooks/rstudio-user-accounts-creation" target="_blank">create RStudio user accounts</a>._

<!-- ## How to build the image in local?

### Using the Gradle Build

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :rstudio-3.6.2:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :rstudio-3.6.2:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `rstudio-x.y` folder corresponding to your version, `technologies/app/rstudio/rstudio-3.6.2`. Use the `cd` command.
2. Run the following command:
    ```bash
    docker build -t saagie/rstudio:3.6.2 .
    ```
     
## How to run the image?

### On Saagie's Platform 

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the Jupyter version and configurations that you want to use.
    ```bash
    docker run --rm -it -p 10087:8787 --name rstudio -e SAAGIE_BASE_PATH=/ -e PASSWORD=yourPassword saagie/rstudio:3.6.2
    ```
   Where:
   - Port `8787` must be mapped to the port you will use on the host side. For example, `10087`.
   - The `SAAGIE_BASE_PATH` environment variable is **optional** when you run the app manually. It is used to customize the access path to the app when it is behind a reverse proxy.
   - The `PASSWORD` environment variable is **mandatory**. It must be set to whatever you will use as a password to access Rstudio. For example, here it is `yourPassword`.
   - You can also share volume to persist or load some notebooks from localhost. For example, with `-v $PWD/rstudio:/home`. This parameter is **optional** but useful. It allows you to mount a volume to the `/home` directory, which allows you to persist all RStudio user projects and settings.
   - By default, the only user able to run `sudo` commands is the `admin`. However, you can also allow it for `rstudio` users by running the container with the `-e ROOT=TRUE` option.
2. Access your local image at `http://localhost:10087`. Use the default user credentials, which are `rstudio` for the login, and `yourPassword` for the password.

> [!NOTE]
> If you want to use [sparklyr](https://spark.rstudio.com/index.html), you will need to mount a few volumes to share your cluster configuration with your container. In this case, try the following: `docker run --rm -it -p 10087:8787 -v $PWD/rstudio:/home -v $PWD/hadoop/conf:/etc/hadoop/conf --name rstudio -e SAAGIE_BASE_PATH=/ -e PASSWORD=yourPassword saagie/rstudio:3.6.2`.
> 
> You may also need to run it in `HOST` mode. If you are using a VPN, for example.
> 
> You can also run RStudio on a custom port, such as `9999`:
> * Bridge mode: `docker run --rm -it -p9999:9999 --name rstudio saagie/rstudio:latest /init_rstudio.sh --port 9999`
> * Host mode: `docker run --rm -it --net=host --name rstudio saagie/rstudio:latest /init_rstudio.sh --port 9999`
-->