#!/usr/bin/env bash

# activate anaconda env
source activate py311

# this is the critical part, and should be at the end of your script:
exec /opt/conda/envs/py311/bin/python -m ipykernel_launcher $@