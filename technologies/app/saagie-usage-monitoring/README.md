# Saagie Usage Monitoring

## Description

This directory contains Saagie Usage Monitoring based on Grafana dashboards.

## How to launch it

To deploy Saagie Usage Monitoring on your platform, you need to create a user with viewer rights on all projects at least, and then set the following environment variables in Saagie :

- SAAGIE_SUPERVISION_LOGIN : Application user's username
- SAAGIE_SUPERVISION_PASSWORD : Application user's password
- SAAGIE_URL : URL of the Saagie plateform (i.e. : `https://saagie-workspace.prod.saagie.io`)
- SAAGIE_PLATFORM_ID : ID of your plateform  (Default value : `1`)
- MONITORING_OPT (default value : `SAAGIE`): 
  - `SAAGIE` if you want to monitor only Saagie jobs, apps and pipelines 
  - `SAAGIE_AND_DATALAKE` if you want to monitor Saagie and your HDFS Datalake
  - `SAAGIE_AND_S3` if you want to monitor Saagie and S3 buckets
- IP_HDFS (Required if MONITORING_OPT=`SAAGIE_AND_DATALAKE`) : Namenode IP
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_ENDPOINT and AWS_REGION_NAME (Required if MONITORING_OPT=`SAAGIE_AND_S3`)
- SAAGIE_PG_HOST : Postgresql host (Default value : `localhost`)
- SAAGIE_PG_PORT : Postgresql port (Default value : `5432`)
- SAAGIE_PG_USER : Postgresql user (Default value : `supervision_pg_user`)
- SAAGIE_PG_PASSWORD : Postgresql password (Default value : ``)
- SAAGIE_PG_DATABASE : Postgresql database (Default value : `supervision_pg_db`)