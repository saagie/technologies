#!/bin/bash
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# echo commands to the terminal output
set -ex

# Check whether there is a passwd entry for the container UID
myuid=$(id -u)
mygid=$(id -g)
# turn off -e for getent because it will return error code in anonymous uid case
set +e
uidentry=$(getent passwd $myuid)
set -e

# If there is no passwd entry for the container UID, attempt to create one
if [ -z "$uidentry" ] ; then
    if [ -w /etc/passwd ] ; then
        echo "$myuid:x:$myuid:$mygid:${SPARK_USER_NAME:-anonymous uid}:$SPARK_HOME:/bin/false" >> /etc/passwd
    else
        echo "Container ENTRYPOINT failed to add passwd entry for anonymous UID"
    fi
fi

# BEGIN SAAGIE SPECIFIC CODE
mkdir -p /opt/spark/conf/
cat conf/*.conf > /opt/spark/conf/spark-defaults.conf
echo "spark.kubernetes.driver.label.io.saagie/spark-submit-pod-uid $SPARK_SUBMIT_POD_UID" >> /opt/spark/conf/spark-defaults.conf

if test -f main_script;
then
    # parse content and if pyfiles extract minio url and inject it
    if grep -q "\--py-files" main_script;
    then
      echo "spark.kubernetes.driverEnv.PYSPARK_FILES `awk -F '.*--py-files=| ' '{print $2}' main_script`" >> /opt/spark/conf/spark-defaults.conf
    fi;
    sh ./main_script;
else exec "$@"
fi;
# END SAAGIE SPECIFIC CODE
