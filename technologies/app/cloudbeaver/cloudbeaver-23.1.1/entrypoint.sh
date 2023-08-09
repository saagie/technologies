#!/bin/bash
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /opt/cloudbeaver/conf/cloudbeaver.conf

/opt/cloudbeaver/run-server.sh
