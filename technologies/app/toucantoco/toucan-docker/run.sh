#!/bin/sh

docker run --rm -it --name toucan-compose \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e SAAGIE_BASE_PATH_FRONT=/front \
  -e SAAGIE_BASE_PATH_BACK=/back \
  -e DOCKER_USER=finalspy \
  -e DOCKER_PASSWD=$DOCKER_PASSWD \
  $1