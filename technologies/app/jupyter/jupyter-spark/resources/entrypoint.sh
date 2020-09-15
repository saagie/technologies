#!/bin/bash
chown -R jovyan /notebooks-dir

FILE_KERNEL_PY36="/home/jovyan/.local/share/jupyter/kernels/py36/kernel.json"

start-notebook.sh --KernelSpecManager.ensure_native_kernel=False --NotebookApp.token='' --NotebookApp.password='' --NotebookApp.base_url=$SAAGIE_BASE_PATH
