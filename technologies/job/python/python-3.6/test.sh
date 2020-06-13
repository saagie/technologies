#!/bin/bash

set -euxo pipefail

docker run --rm -i -v $PWD:/python3 -v /var/run/docker.sock:/var/run/docker.sock saagie/container-structure-test structure-test  test --image $1 --config python3/image_test.yml
