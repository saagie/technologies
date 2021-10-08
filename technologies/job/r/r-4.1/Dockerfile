ARG base_img

FROM ${base_img} AS BASE_IMG

LABEL maintainer="Saagie"

# pre requisite as of 20201216 to install properly prophet package
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        build-essentials libv8-dev libxml2-dev  \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/* \
    && rm -rf /var/log/*

RUN install2.r -n `nproc --all` -e -s \
    rstantools \
    bit \
    fastmatch \
    gsubfn \
    lattice \
    Matrix \
    proto \
    rjson \
    RSQLite \
    survival \
    ade4 \
    argparse \
    arules \
    arulesSequences \
    AUC \
    aws.s3 \
    betareg \
    breakpoint \
    cairoDevice \
    caret \
    caretEnsemble \
    cartography \
    changepoint \
    classInt \
    cluster \
    colorspace \
    corrplot \
    colourpicker \
    curl \
    data.table \
    dbscan \
    DescTools \
    doParallel \
    doSNOW \
    dtplyr \
    dtw \
    dtwclust \
    dummies \
    dygraphs \
    ff \
    ffbase \
    forecast \
    ggplot2 \
    glmnet \
    hunspell \
    kernlab \
    kknn \
    kohonen \
    leaflet \
    lsa \
    mapproj \
    maps \
    maptools \
    mclust \
    mlogit \
    mvoutlier \
    plotly \
    pls \
    prophet \
    pvclust \
    rattle \
    readxl \
    rvest \
    scales \
    shinythemes \
    skmeans \
    sp \
    sqldf \
    topicmodels \
    tm \
    tree \
    trend \
    wordcloud \
    e1071 \
    factoextra \
    FactoInvestigate \
    FactoMineR \
    Factoshiny \
    FNN \
    futile.logger \
    h2o \
    implyr \
    jsonlite \
    knitr \
    labeling \
    LDAvis \
    leaps \
    magrittr \
    markdown \
    missMDA \
    networkD3 \
    odbc \
    packrat \
    pROC \
    proxy \
    randomForest \
    RcmdrMisc \
    RColorBrewer \
    Rcpp \
    readr \
    recommenderlab \
    reshape2 \
    rJava \
    RJDBC \
    RMySQL \
    ROCR \
    ROSE \
    rpart.plot \
    RSelenium \
    rsparkling \
    Rtsne \
    RWeka \
    sas7bdat \
    shiny \
    shinydashboard \
    shinyjs \
    SnowballC \
    stringi \
    stringr \
    syuzhet \
    TSclust \
    tseries \
    xgboost \
    xts