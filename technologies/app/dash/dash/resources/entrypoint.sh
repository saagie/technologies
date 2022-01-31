#!/bin/bash

set -xeuo pipefail

echo "
- INFO: 'DASH_GIT_URL_REPOSITORY' variable is mandatory and should be set to the name of the git repository containning your Dash app source code (e.g.:https://github.com/saagie/demo-r-shiny.git).
- INFO: 'DASH_GIT_BRANCH' is optional and defaulted to master, it indicates a specific branch to checkout.

- INFO: the default branch for gitlab is 'master'
- INFO: the default branch for github is 'main'

INFO: If you hae any request don't hesitate to create an issue in this repository: https://github.com/saagie/technologies
INFO: Did you take a look to our community repository? https://github.com/saagie/technologies-community
"

if [[ -z "${SHINY_GIT_URL_REPOSITORY}" ]]; then
  echo "ERROR : Variable DASH_GIT_URL_REPOSITORY must be set before running the app. 
  See https://docs.saagie.io/user/latest/tutorials/projects-module/projects/envar/index.html#projects-create-envar-project for more information"
  exit 1
fi

DASH_GIT_BRANCH=${DASH_GIT_BRANCH:-master}
echo "Setting DASH_GIT_BRANCH to $DASH_GIT_BRANCH..."

git clone $DASH_GIT_URL_REPOSITORY --branch $DASH_GIT_BRANCH --single-branch --depth 1 app

cd app

pip install -r ./requirements.txt

export DASH_URL_BASE_PATHNAME=${SAAGIE_BASE_PATH}"/"

python -u ./app.py
