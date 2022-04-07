#!/bin/bash

export CLASSPATH=`hadoop classpath --glob`

chown -R jovyan /notebooks-dir

start-notebook.sh --KernelSpecManager.ensure_native_kernel=False --ServerApp.token='' --ServerApp.password='' --ServerApp.base_url=$SAAGIE_BASE_PATH
