#!/bin/bash
set -e

if [[ "$1" = "serve" ]]; then
    shift 1
    torchserve --start --ts-config /home/model-server/config.properties --model-store /home/model-server/model-store
    gunicorn -b 0.0.0.0:8079 serve-api
else
    eval "$@"
fi

# prevent docker exit
tail -f /dev/null
