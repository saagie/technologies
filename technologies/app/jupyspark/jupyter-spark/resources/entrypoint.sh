#!/bin/bash
chown -R jovyan /notebooks-dir

FILE_KERNEL_PY36="/home/jovyan/.local/share/jupyter/kernels/py36/kernel.json"

sed -i 's:SPARK_UI_PATH:'$SPARK_UI_PATH':g' /etc/nginx/sites-available/default
nginx
start-notebook.sh --KernelSpecManager.ensure_native_kernel=False --NotebookApp.token='' --NotebookApp.password='' --NotebookApp.base_url=$SAAGIE_BASE_PATH
