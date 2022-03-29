#!/bin/bash

set -euo pipefail

R_HOME=$(Rscript -e 'Sys.getenv("R_HOME")' | sed -rn 's/^\[[[:digit:]]+\] "(.*)"/\1/p')

# Change default CRAN to ENV VAR if present
if [[ "${R_CUSTOM_CRAN:-empty}" == "empty" ]]; then
    echo "No custom CRAN defined, using default, you can configure one using R_CUSTOM_CRAN env var"
else
    echo "Custom CRAN used: ${R_CUSTOM_CRAN}"
    sed -ri "s#(CRAN = ')[^']*#\1${R_CUSTOM_CRAN}#g" "${R_HOME}/etc/Rprofile.site"
fi

if compgen -G "*.zip" > /dev/null; then
    echo "Zip file detected ... unzipping ..."
    unzip -qo *.zip
elif compgen -G "*.tar.gz" > /dev/null; then
    echo "Tar gz file detected ... unzipping ..."
    tar -xf *.tar.gz
elif compgen -G "*.tar" > /dev/null; then
    echo "Tar file detected ... unzipping ..."
    tar -xf *.tar
fi

if test -f main_script; then
    echo "'main_script' detected ... executing ..."
    bash ./main_script
else
    exec "$@"
fi
