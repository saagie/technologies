#!/usr/bin/env bash

# activate anaconda env
source activate py39

# this is the critical part, and should be at the end of your script:
exec /opt/conda/envs/py39/bin/python -m ipykernel_launcher $@