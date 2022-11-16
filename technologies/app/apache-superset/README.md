# Apache Superset

## Description
This directory contains version of Apache Superset contenairized and customized for Saagie Platform.
See Apache Superset official documentation for more information https://superset.apache.org/docs/intro

## How to build in local

Inside the `apache-superset-x.y` folder corresponding to your version, run :
```
docker build -t saagie/apache-superset-<version> .
docker push saagie/apache-superset-<version>
```

## Job/App specific information
Default admin credentials are `admin/admin`. Change them during your first connection.

## Improvements
Apache Superset does not support the configuration of a base url so currently this app relies on nginx subfilters that rewrites hardcoded urls (such as assets for instance) in html. This works but is not optimal and requires to disable gzip compression. Hardcoded urls in javascript are replaced during startup direclty in the python lib folder (see `entrypoint.sh`).
