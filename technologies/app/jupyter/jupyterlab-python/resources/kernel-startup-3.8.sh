#!/usr/bin/env bash

# activate anaconda env
source activate py38

# this is the critical part, and should be at the end of your script:
exec /opt/conda/envs/py38/bin/python -m ipykernel_launcher $@