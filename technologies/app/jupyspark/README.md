# Jupyter Datascience Notebook for Python - customized by Saagie

This Docker image is officially available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/jupyter-python-nbk) under jupyspark tags and is based on Saagie's jupyter base image - see (this documentation)[../jupyter/README.md]
It is designed to run on Saagie's platform v2.

## Build the image

You can build the image with either Gradle or Docker.

Gradle builds take place in the root of the project as a whole.
Docker builds take place in the directory for the individual technology.

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin).

To build the project, go to the root of this project.
Then run:

```
./gradlew :jupyter-spark:buildImage
```

If you want to test the image, you can run:
```
./gradlew :jupyter-spark:testImage
```

### Using docker commands

Prerequisite: saagie/jupyter-base image exists and is built - refer to [this documentation](../jupyter/README.md).

First go to context/version sub-directory of the technology:

```
cd jupyter-spark
```

Then run the following command:
```
docker build -t saagie/jupyter-python-nbk:v2-spark .
```
It builds the image based on the image `"saagie/jupyter-python-nbk:v2-1.61.0"`

You can base it on another image by using the build argument BASE_CONTAINER with the repo/image:tag of the image you want to use.

Example: 
```
docker build --build-arg BASE_CONTAINER=saagie/jupyter-python-nbk:v2-1.58.0 -t saagie/jupyter-python-nbk:v2-spark .
```

     
## Run Jupyter container

### On Saagie's Platform 

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html).

### On premise / your local server

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

Run: 

```
docker run --rm --name jupyspark -p 18888:8888 -p 14040:4040 -v /path/to/persistent/folder/jupyter-workdir:/notebooks-dir saagie/jupyter-python-nbk:v2-spark	
```

 * Port `8888` should be mapped to the one you will be using on host side (example: `18888`).
 * Port `4040` should be mapped to the one you will be using on host side (example: `14040`) for Spark UI
 * SAAGIE_BASE_PATH variable is optional when run manually.
 * Mounting volume is optional (-v /path/to/persistent/folder/jupyter-workdir:/notebooks-dir) but if you need it:
 * create your local directory with: `mkdir -p /path/to/persistent/folder/jupyter-workdir`
 * make Jovyan (Jupyter notebook default user) the owner of this directory with: `chown -R 1000:1000 /path/to/persistent/folder/jupyter-workdir`

Then you'll be able to access Jupyter at (http://localhost:18888).
Once a Spark process runs, the SparkUI will be available on (http://localhost:14040).


## Known limitations

Currently, this image only allows access to one SparkUI.
If you launch several Spark processes in different notebooks, it will create a new SparkUI on base port 4040+n (where n is the number of the Spark process/Jupyter notebook), but it will not be accessible by default externally. 
If you need to launch multiple Spark processes and access multiple SparkUIs, we suggest you run several containers in parallel.
This limitation is due to the fact that, for Spark versions 3.x and earlier, the Spark reverse proxy built-in functionality is temperamental (buggy).

## Libraries

See [Saagies' Jupyter base image ](../jupyter/README.md) for specificities.