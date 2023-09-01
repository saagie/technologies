#!/usr/bin/env bash

# activate anaconda env
source activate py310

# this is the critical part, and should be at the end of your script:
exec /opt/conda/envs/py310/bin/python -m ipykernel_launcher $@