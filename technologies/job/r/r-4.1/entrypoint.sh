#!/bin/bash

set -euo pipefail
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
