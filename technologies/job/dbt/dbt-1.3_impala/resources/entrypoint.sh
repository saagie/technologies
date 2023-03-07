#!/bin/bash
set -euo pipefail

if compgen -G "*.zip*" > /dev/null;
then
    unzip -q *.zip
else
    echo "ERROR : You must submit a zip file containing your dbt project"
fi

if test -f main_script;
then sh ./main_script;
else exec "$@"
fi;
