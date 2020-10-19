#!/bin/bash

# As we should run this container in HOST mode to be able to access the Spark cluster,
# we need to parse arguments to get a port on which to run Zeppelin.
# If no port provided, let it run on default port (8080)
# If you want to change Zeppelin log level,
# you can also pass a '-d' or '--debug' option and give it the requested log level.

TEMP=`getopt -o p:d: --long port:,debug: -- "$@"`
eval set -- "$TEMP"

while true ; do
  case "$1" in
    -d|--debug)
      case "$2" in
        "") shift 2 ;;
        *) DEBUG=$2 ; shift 2 ;;
      esac ;;
    -p|--port)
      case "$2" in
        "") shift 2 ;;
        *) PORT=$2 ; shift 2 ;;
      esac ;;
    --) shift ; break ;;
    *) echo "Internal error!" ; exit 1 ;;
  esac
done

echo "" > /zeppelin/conf/zeppelin-env.sh
if [ -z $PORT ]
then
  echo "WARNING: no port given. Zeppelin will run on default port."
  export PORT0=8080
else
  # If not already set, set a fake PORT0 variable (used in spark-env.sh)
  if [ -z $PORT0 ]
  then
    export PORT0=$(( $PORT+1 ))
    echo "WARNING: no PORT0 environment variable provided. $PORT0 will be used..."
  fi
  echo "export ZEPPELIN_PORT=$PORT" >> /zeppelin/conf/zeppelin-env.sh
fi

if [ -z $DEBUG ]
then
  echo "INFO: Zeppelin will log with default log level."
else
  echo "INFO: Zeppelin will log with $DEBUG log level."
  sed -i -e "s/INFO/$DEBUG/g" /zeppelin/conf/log4j.properties
fi

# As volumes are mounted at container startup,
# we need to grab mounted Spark conf and overwrite the default one before
# before running Zepplin
if [ -f "/usr/local/spark/conf/spark-env.sh" ]
then
  # overwrite Spark current config
  echo "INFO: ovewriting default spark-env.sh"
  cp /usr/local/spark/conf/spark-env.sh ${SPARK_HOME}/conf
  chmod 755 ${SPARK_HOME}/conf/spark-env.sh
else
  # use default config
  echo "WARNING: NO CUSTOM spark-env.sh PROVIDED. USING DEFAULT TEMPLATE."
  cp ${SPARK_HOME}/conf/spark-env.sh.template ${SPARK_HOME}/conf/spark-env.sh
fi

# Create Zeppelin conf
if [ -f "/tmp/spark-defaults.conf" ]
then
  MASTER=`grep spark.master /tmp/spark-defaults.conf | sed "s/spark.master\s*//g"`

  if [ -z $MASTER ]
  then
    echo "WARNING: unable to find spark.master in /tmp/spark-defaults.conf. Using default in-memory Spark."
    unset SPARK_HOME
  else
    echo "INFO: Using the following Spark master: $MASTER"
    echo "export MASTER=$MASTER" >> /zeppelin/conf/zeppelin-env.sh
  fi
else
  echo "WARNING: no spark-default.conf provided. Using default in-memory Spark."
  echo "Use SPARK_HOME=$SPARK_HOME"
  echo "export SPARK_HOME=$SPARK_HOME" >> /zeppelin/conf/zeppelin-env.sh
fi



# Run another script to upgrade Spark interpreter config after Zeppelin boot
/zeppelin/saagie-zeppelin-config.sh &

# Copy interpreter.json from persisted folder if exists
if [ -f "/notebook/interpreter.json" ]
then
  cp -f /notebook/interpreter.json /zeppelin/conf/interpreter.json
fi

#Launch cron
cron

# Run Zeppelin
echo "Running Apache Zeppelin..."
/zeppelin/bin/zeppelin.sh
