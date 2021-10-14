# Grafana
![Docker Image Size (tag)](https://img.shields.io/docker/image-size/saagie/grafana/8.2.1?label=8.2.1%20image%20size&style=for-the-badge)

## Description
This directory contains version of Grafana contenairized and customized for Saagie Platform.
See Grafana official documentation for more information https://grafana.com/docs/grafana/latest/

## How to build in local

Inside the `grafana-x.y.z` folder corresponding to your version, run :
```
docker build -t saagie/grafana:<version> .
docker push saagie/grafana:<version>
```


## Job/App specific information
Default admin login is `admin`. Default admin password must be set with the GRAFANA_ADMIN_PASSWORD environment variable. 
