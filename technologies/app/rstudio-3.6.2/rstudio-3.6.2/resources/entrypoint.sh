#!/bin/bash

# customise global profile to propagate some path to rstudio terminal (not for the R console)
# for R console see modifications to userconf file
sed -i 's%/usr/local/games:/usr/games%${JAVA_HOME}/bin:${HADOOP_HOME}/bin:${HIVE_HOME}/bin%g' /etc/profile

sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /etc/nginx/sites-enabled/rstudio.conf
nginx && /init_rstudio.sh