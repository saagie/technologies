ARG PYTHON311_IMG
ARG BASE_CONTAINER

FROM $PYTHON311_IMG AS PYTHON311
FROM $BASE_CONTAINER

LABEL Maintainer="Saagie"

################ Kernels / Conda envs / requirements PART BEGIN ################
USER $NB_USER

# Update conda to latest version and install jupyterlab-git plugin
RUN conda update -n root conda \
    && conda install -c conda-forge jupyterlab==4.0.5 jupyterlab-git \
    && conda clean -ay

RUN conda create -n py38 python=3.8.12 \
    && bash -c "source activate py38 && conda install notebook ipykernel -y && ipython kernel install --user --name py38  --display-name 'Python 3.8'" \
    && conda create -n py39 python=3.9.10 \
    && bash -c "source activate py39 && conda install notebook ipykernel -y && ipython kernel install --user --name py39  --display-name 'Python 3.9'" \
    && conda create -n py310 python=3.10.2 \
    && bash -c "source activate py310 && conda install notebook ipykernel -y && ipython kernel install --user --name py310  --display-name 'Python 3.10'" \
    && conda create -n py311 python=3.11.2 \
    && bash -c "source activate py311 && conda install notebook ipykernel -y && ipython kernel install --user --name py311  --display-name 'Python 3.11'" \
    && conda clean -ay \
    && rm -rf ~/.cache/pip

# Updating kernels to force activating conda env whenever opening a console
ADD resources/kernel-3.8.json /home/$NB_USER/.local/share/jupyter/kernels/py38/kernel.json
ADD resources/kernel-3.9.json /home/$NB_USER/.local/share/jupyter/kernels/py39/kernel.json
ADD resources/kernel-3.10.json /home/$NB_USER/.local/share/jupyter/kernels/py310/kernel.json
ADD resources/kernel-3.11.json /home/$NB_USER/.local/share/jupyter/kernels/py311/kernel.json
ADD resources/kernel-*.sh /

# Uninstall default python3 kernel
RUN jupyter kernelspec remove -f python3
SHELL ["/bin/bash", "-c"]
COPY --from=PYTHON311 /tmp/requirements.txt /home/$NB_USER/requirements.txt

RUN sh -x \
    && pip install jupyter_ai==2.1.0 \
    && for env in py38 py39 py310 py311;  \
       do \
          . activate $env \
          && python -m pip install --no-cache-dir -r /home/$NB_USER/requirements.txt \
          && python -m pip uninstall matplotlib -y \
          && grep matplotlib* /home/$NB_USER/requirements.txt | xargs python -m pip install --no-cache \
          && pip install jupyter_ai==2.1.0 \
          && conda deactivate; \
       done \
    && conda clean -ay \
    && rm -rf ~/.cache/pip


################ Kernels / Conda envs / requirements PART ENDS #################

# Should run as $NB_USER  ... but ...
# USER $NB_USER
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root
RUN chmod +x /kernel-*.sh

# Runs Jupyter in a loop so that quitting Jupyter does not cause the container to exit.
ENV RESTARTABLE yes



