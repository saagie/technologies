# RStudio Server - customized by Saagie

This Docker image is available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/rstudio) is based on the official [rocker/tidyverse:3.6.2](https://hub.docker.com/r/rocker/tidyverse/) image.

It is specially designed to run on Saagie's V2 platform.

It adds a few features, such as:
* [sparklyr](https://spark.rstudio.com/index.html): Connect to [Spark](http://spark.apache.org/) from R
* [Saagie Add-in](https://github.com/saagie/rstudio-saagie-addin): Push R jobs to Saagie's platform
* Create multiple users accounts
* Numerous other libs (see below fos a list), making this image quite heavy

## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin). 

To build the project, go to the root of this project.
Then run:

```
./gradlew :rstudio-3.6.2:buildImage
```

If you want to test the image, you can run:
```
./gradlew :rstudio-3.6.2:testImage
```

### Using docker commands

First go to context/version sub-directory:

```
cd rstudio-3.6.2
```

Then run the following command:
```
docker build -t saagie/rstudio:3.6.2 .
```
     
## Run RStudio container

### On Saagie's Platform 

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html).

### On premise / your local server

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

Run: 
```
docker run --rm -it -p 10087:8787 --name rstudio -e SAAGIE_BASE_PATH=/ -e RSTUDIO_PASSWORD=yourPassword -e RSTUDIO_ADMIN_PASSWORD=yourAdminPassword saagie/rstudio:3.6.2
```

 - Port `8787` should be mapped to the one you will be using on host side (here `10087`).
 - `SAAGIE_BASE_PATH` variable is **mandatory** and should be equal to / . It's used to customize the path to the application when behind a reverse proxy.
- `RSTUDIO_PASSWORD` variable is also **mandatory** and should be set to whatever you'll be using as a password to access Rstudio, here `yourPassword`
- `RSTUDIO_ADMIN_PASSWORD` variable is also **mandatory** and should be set to whatever you'll be using as the admin password to access Rstudio, here `yourAdminPassword`

You can also share volume to persist or load some notebooks from localhost.
For example:
  `-v $PWD/rstudio:/home`

Then you'll be able to access RStudio at http://localhost:10087 using the default user (login: rstudio, password: yourPassword).
Mounting a volume to `/home` directory allows you to persist all RStudio user projects and settings.
The `-v $PWD/rstudio:/home` part is optional but useful.

By default, the only user able to run `sudo` commands is `admin`, but you can also allow it for `rstudio` user by running the container with `-e ROOT=TRUE` option.

If you want to use [sparklyr](https://spark.rstudio.com/index.html) you'll need to mount a few volumes to share your cluster configuration with your container.
In this case, try something like:
```
docker run --rm -it -p 10087:8787 -v $PWD/rstudio:/home -v $PWD/hadoop/conf:/etc/hadoop/conf --name rstudio -e SAAGIE_BASE_PATH=/ -e RSTUDIO_PASSWORD=yourPassword -e RSTUDIO_ADMIN_PASSWORD=yourAdminPassword saagie/rstudio:3.6.2
```
And you may also need to run it in HOST mode (for example, if you're using a VPN).

You can also run RStudio on a custom port, such as `9999`:
* Bridge mode: `docker run --rm -it -p9999:9999 --name rstudio saagie/rstudio:latest /init_rstudio.sh --port 9999`
* Host mode: `docker run --rm -it --net=host --name rstudio saagie/rstudio:latest /init_rstudio.sh --port 9999`

## Create new RStudio users

If you want to create new RStudio users, you'll need to log in to RStudio as: `admin` (password: `${RSTUDIO_ADMIN_PASSWORD}`).
Then go to '*Tools > Shell*' and run `sudo adduser my_new_user`.
You'll be prompted to enter admin's password, and then to choose your new user's password. No need to fill in the other fields.
If you want to allow this new user to install libraries, you need to add him to the *staff* group using the following command: `sudo adduser my_new_user staff`.

**Important note:** After you created a new user, remember to run `./backupusers`. This will backup users info in a tarball. If you add mounted a volume to `/home`, every user will be recreated on next container startup.

## List of additional libs 

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
