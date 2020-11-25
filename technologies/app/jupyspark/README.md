# Jupyter Datascience Notebook for python - customized by Saagie

This Docker image officially available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/jupyter-python-nbk) under jupyspark tags and is based on Saagie's jupyter base image - see (this docuementation)[../jupyter/README.md]
It is designed to run on Saagie's platform v2.

## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin)

To build the project go up 3 directories to be at the root of this project.
Then run :

```
./gradlew :jupyter-spark:buildImage
```

If you want to test the image you can run :
```
./gradlew :jupyter-spark:testImage
```

### Using docker commands

Pre-requisite : saagie/jupyter-base image exists and is built - see [this documentation](../jupyter/README.md)
First go to context/version sub-directory :

```
cd jupyter-spark
```

Then run the following command:
```
docker build -t saagie/jupyter-python-nbk:v2-spark .
```
It builds the image based oin the following one : `"saagie/jupyter-python-nbk:v2-1.61.0"`

You can base it on another version/tag by using the build argument BASE_CONTAINER with the name:ta of the image you want to use.

eg: 
```
docker build --build-arg BASE_CONTAINER=saagie/jupyter-python-nbk:v2-1.58.0 -t saagie/jupyter-python-nbk:v2-spark .
```

     
## Run Jupyter container

### On Saagie's Platform 

This container is supposed to be run on Saagie's platform.

Official documentation is available here : [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html)

### On premise / your local server

Anyway, it is possible mainly for development and tests to run this image outside Saagie.
Please note that Saagie won't provide any support regarding images launched outside it's platform.

Simply run: 

```
docker run --rm --name jupyspark -p 18888:8888 -p 14040:4040 -v /path/to/persisten/folder/jupyter-workdir:/notebooks-dir saagie/jupyter-python-nbk:v2-spark	
```

 * Port `8888` should be mapped to the one you will be using on host side (here `18888`).
 * Port `4040` should be mapped to the one you will be using on host side (here `14040`) for spark UI
 * SAAGIE_BASE_PATH variable is optional when run manually.
 * Mounting volume is optional (-v /path/to/persisten/folder/jupyter-workdir:/notebooks-dir) but if you want to do it:
 * create your local directory with: `mkdir -p /path/to/persisten/folder/jupyter-workdir`
 * make Jovyan (Jupyter notebook default user) the owner of this directory with: `chown -R 1000:1000 /path/to/persisten/folder/jupyter-workdir`

Then you'll be able to access Jupyter at (http://localhost:18888) and once a spark porcess is run the sparkUI will be available on (http://localhost:14040)


## Known limitations :

Currently this image only allows the access to one SparkUI, given that if you launch several spark pocess in deifferent notebooks it will create a new sparkUI on base port 4040+n (where n is the number of the spark process/jupyter notebook), but it will not be accessible by default externally. 
If you need to launch multiple spark process and access multiple sparkUIs we suggest you run several containers in parallel.
This limnitation is due to the fact that the spark reverse proxy native functionnality is buggy for spark < 3.x

## Libraries :

See [Saagies' Jupyter base image ](../jupyter/README.md) for specificities.