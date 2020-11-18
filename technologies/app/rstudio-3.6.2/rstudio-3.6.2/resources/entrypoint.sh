#!/bin/bash
if [ -z ${RSTUDIO_ADMIN_PASSWD+x} ]; then echo "Environment variable RSTUDIO_ADMIN_PASSWD is not set !"; echo "Please set it !"; echo " => exiting"; fi
if [ -z ${RSTUDIO_PASSWD+x} ]; then echo "Environment variable RSTUDIO_PASSWD is not set !"; echo "Please set it !"; echo " => exiting"; else export PASSWORD=`echo $RSTUDIO_PASSWD`; fi

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/rstudio.conf
nginx && /init_rstudio.sh