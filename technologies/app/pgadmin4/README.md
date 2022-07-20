# PGadmin4

## Description
pgAdmin 4 is a complete rewrite of pgAdmin, built using Python and Javascript/jQuery. A desktop runtime written in NWjs allows it to run standalone for individual users, or the web application code may be deployed directly on a web server for use by one or more users through their web browser. The software has the look and feels of a desktop application whatever the runtime environment is, and vastly improves on pgAdmin III with updated user interface elements, multi-user/web deployment options, dashboards, and a more modern design.

## Environment Variables

Two mandatory environment variables:
- $PGADMIN_DEFAULT_EMAIL: Default user
- $PGADMIN_DEFAULT_PASSWORD: Default password

One implicit environment variable:
- $SAAGIE_BASE_PATH: Base URL


## How to run image in local

```
docker run -p81:80 -e PGADMIN_DEFAULT_EMAIL=user@my_mail.com \
                    -e PGADMIN_DEFAULT_PASSWORD=password \
                    -e SAAGIE_BASE_PATH="/baseurl" \
                    saagie/pgadmin4
```




For Saagie deploiement, uncheck checkbox "Use rewrite url".

