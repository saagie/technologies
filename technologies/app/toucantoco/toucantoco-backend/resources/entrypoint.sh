#!/bin/bash

sudo sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/toucan_backend.conf
nginx && /data/toucan_scripts/entrypoint.sh
