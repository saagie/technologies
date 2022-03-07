#!/usr/bin/env bash
shuffle=false

if [ -z "$SPARK_VERSION" ]; then
    export SPARK_VERSION=$APACHE_SPARK_VERSION
fi

export HADOOP_CONF_DIR=/etc/hadoop/conf/

#this a hack
export SPARK_CONF_DIR=$SPARK_HOME/conf
echo "spark.ui.port     $PORT0" >> $SPARK_CONF_DIR/spark-defaults.conf
echo "spark.driver.port $PORT1" >> $SPARK_CONF_DIR/spark-defaults.conf
echo "spark.shuffle.service.enabled               $shuffle" >> $SPARK_CONF_DIR/spark-defaults.conf
echo "spark.dynamicAllocation.enabled             $shuffle" >> $SPARK_CONF_DIR/spark-defaults.conf
