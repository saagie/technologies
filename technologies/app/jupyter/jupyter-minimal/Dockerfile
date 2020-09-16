# use latest image with ubuntu 16.04 Xenial for CDH5 compatibility
# see (https://github.com/jupyter/docker-stacks/commits/master?after=04f7f60d34a674a2964d96a6cb97c57a7870a828+664)
FROM jupyter/minimal-notebook:f9e77e3ddd6f

MAINTAINER Saagie

ENV PATH="${PATH}:/home/$NB_USER/.local/bin"

# Starts by cleaning useless npm cache & other files
RUN npm cache clean --force \
    && conda clean -ay \
    && rm -rf $CONDA_DIR/share/jupyter/lab/staging
# Not necessary to apt-get clean it seems

########################## LIBS PART BEGIN ##########################
USER root
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
      curl \
    && rm -rf /var/lib/apt/lists/*
########################## LIBS PART END ##########################


################ Kernels / Conda envs / requirements PART BEGIN ################
USER $NB_USER
# Uninstall python3 kernel
RUN jupyter kernelspec remove -f python3

# Update conda to latest version
#RUN conda update -n root conda \
RUN conda clean -ay

# seems there's sometimesa problem with pyzmq so need to reinstall it...
RUN conda create -n py36 python=3.6 \
    && bash -c "source activate py36 && pip uninstall pyzmq -y && pip install pyzmq && conda install notebook ipykernel -y && ipython kernel install --user --name py36 --display-name 'Python 3.6'" \
    && conda clean -ay \
    && rm -rf ~/.cache/pip
################ Kernels / Conda envs / requirements PART ENDS #################

########################## NOTEBOOKS DIR ##########################
USER root
# Create default workdir (useful if no volume mounted)
RUN mkdir /notebooks-dir && chown 1000:100 /notebooks-dir
# Define default workdir
WORKDIR /notebooks-dir
########################## NOTEBOOKS DIR  END ##########################

#Add entrypoint.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Should run as $NB_USER  ... but ...
# USER $NB_USER
# Saagie mounts the /notebook-dir as root so it needs to be chown in the entrypoint as root
USER root

# Default: run without authentication
CMD ["/entrypoint.sh"]
