# JupyterLab Datascience Notebook for Python - customized by Saagie

This Docker image is officially available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/jupyter-python-nbk) and is based on the official [FROM jupyter/minimal-notebook:f9e77e3ddd6f](https://hub.docker.com/r/jupyter/minimal-notebook/) image.

It is specially designed to run on Saagie's platform v2.

#FIXME
It relies upon a first minimal image based on Jupyter official one plus some features required by Saagie's platform.
Then it provides the Saagie base image of Jupyter using the minimal image and includes all the Python libraries from Saagie's Python image [saagie/python:3.9](https://hub.docker.com/r/saagie/python)


## Build the image

You can build the image with either Gradle or Docker.

Gradle builds take place in the root of the project as a whole.
Docker builds take place in the directory for the individual technology.

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin).

To build the project, go to the root of this project.
Then run:

```
./gradlew :jupyterlab:buildImage
```

If you want to test the image, you can run:
```
./gradlew :jupyterlab:testImage
```

### Using Docker commands

First go to context/version sub-directory for the base image of the technology:

```
cd technologies/app/jupyterlab/jupyterlab-base
```

Then run the following command:
```
docker build -t saagie/jupyterlab-python-nbk:3.8-3.9-base .
```
It builds the intermediate minimal image.

Then go to the base folder 
```
cd ../jupyterlab
```

And run:
```
docker build --build-arg BASE_CONTAINER=saagie/jupyterlab-python-nbk:3.8-3.9-base -t saagie/jupyterlab-python-nbk:3.8-3.9 .
```

     
## Run Jupyter container

### On Saagie's Platform 

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html)

### On premise / your local server

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

Run: 

```
docker run --rm --name jupyter -p 18888:8888 -v /path/to/persisten/folder/jupyter-workdir:/notebooks-dir saagie/jupyterlab:3.8-3.9-base	
```

 * Port `8888` should be mapped to the one you will be using on host side (example: `18888`).
 * SAAGIE_BASE_PATH variable is optional when run manually.
 * Mounting volume is optional (-v /path/to/persisten/folder/jupyter-workdir:/notebooks-dir) but if you need it:
 * create your local directory with: `mkdir -p /path/to/persisten/folder/jupyter-workdir`
 * make Jovyan (Jupyter notebook default user) the owner of this directory with: `chown -R 1000:1000 /path/to/persisten/folder/jupyter-workdir`

Then you'll be able to access Jupyter at (http://localhost:18888).



## Install libraries with

	!pip install libraryName

