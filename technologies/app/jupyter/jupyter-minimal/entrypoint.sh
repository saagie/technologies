#!/bin/bash
start-notebook.sh --KernelSpecManager.ensure_native_kernel=False --NotebookApp.token='' --NotebookApp.password='' --NotebookApp.base_url=$SAAGIE_BASE_PATH
