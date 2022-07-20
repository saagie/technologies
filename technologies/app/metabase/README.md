# Metabase

## Description
This directory contains version of Metabase contenairized and customized for Saagie Platform.
See Metabase official documentation for more information https://www.metabase.com/docs/latest/

## How to build in local

Inside the `metabase-x.y` folder corresponding to your version, run :
```
docker build --build-arg METABASE_VERSION=<version> -t saagie/metabase:<version> .
docker push saagie/metabase:<version>
```

## Job/App specific information
Default admin credentials are to be created during first login.

## Configuration
This version comes with a local H2 table to store Metabase internal data. You can choose to use an external MySQL / PostgreSQL table to do so. This can be configured (among other parameters) through environment variables. Follow this [documentation](https://www.metabase.com/docs/latest/operations-guide/environment-variables.html) for more information.

## Configure Athena
When configuring Athena in Metabase, you'll need to add the following connection string:
UseResultsetStreaming=0
