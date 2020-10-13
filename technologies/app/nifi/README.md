# Apache Nifi

## Goal
This directory contains version of Nifi contenairized and customized for Saagie Platform.

## Versions summary
 - [1.9.2](1.9.2/) temporary dev image can be pulled from `ypetit/test:nifi_nginx`

## Pre requisites
In order to make this container work properly, you'll need to :
 - Expose port `80`
 - use `$SAAGIE_BASE_PATH` as name to Inject base path variable
 - Do not rewrite URLs
 - provide `$NIFI_WEB_HTTP_HOST` with the platform instance hostname \
   (eg: saagie1-beta.a36152.saagie.cloud)


## Pending questions :
 - How to handle site to site communication
 - How to query API from external location
 - How to save and persist templates (some say they are saved in nifi `conf` folder under `flow.xml.gz`)
