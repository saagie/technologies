#!/bin/bash

if [[ -z ${$RSTUDIO_ADMIN_PASSWORD} || -z ${$RSTUDIO_PASSWORD} ]]; then
  echo "ERROR : Missing environment variables. In order to work, this app needs the following environment variables set : "
  echo "RSTUDIO_ADMIN_PASSWORD : Password for the user admin, with root permissions"
  echo "RSTUDIO_PASSWORD : Password for the user rstudio"
  exit 1
fi

R_HOME=$(Rscript -e 'Sys.getenv("R_HOME")' | sed -rn 's/^\[[[:digit:]]+\] "(.*)"/\1/p')

# Change default CRAN to ENV VAR if present
if [[ -z "${R_CUSTOM_CRAN}" ]]; then
    echo "No custom CRAN defined, using default, you can configure one using R_CUSTOM_CRAN env var"
else
    echo "Custom CRAN used: ${R_CUSTOM_CRAN}"
    sed -ri "s#(CRAN = ')[^']*#\1${R_CUSTOM_CRAN}#g" "${R_HOME}/etc/Rprofile.site"
fi

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/rstudio.conf
nginx && /init_rstudio.sh