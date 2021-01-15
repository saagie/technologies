#!/bin/bash

set -xeuo pipefail

git clone $DASH_GIT_URL_REPOSITORY app

cd app
git checkout $DASH_GIT_BRANCH

pip install -r ./requirements.txt

# replace the Saagie base path in the app main file
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' app.py

python -u ./app.py
