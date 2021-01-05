#!/usr/bin/env bash

git clone $GIT_URL_REPOSITORY app
cd app
export DASH_URL_BASE_PATHNAME=$SAAGIE_BASE_PATH"/"
pip install -r ./requirements.txt
python ./app.py
