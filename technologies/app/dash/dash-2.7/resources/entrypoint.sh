#!/bin/bash

set -euo pipefail

DASH_GIT_BRANCH=${DASH_GIT_BRANCH:-master}
echo "Setting DASH_GIT_BRANCH to $DASH_GIT_BRANCH..."

git clone $DASH_GIT_URL_REPOSITORY --branch $DASH_GIT_BRANCH --single-branch --depth 1 app

cd app

pip install -r ./requirements.txt

export DASH_URL_BASE_PATHNAME=${SAAGIE_BASE_PATH}"/"

python -u ./app.py
