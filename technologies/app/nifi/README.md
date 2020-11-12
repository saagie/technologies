# [Lab] Apache Nifi - customized by Saagie

This Docker image officially available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/nifi) is based on official [apache/nifi:1.9.2](https://hub.docker.com/r/apache/nifi/) image.

It is specially designed to run on Saagie's platform v2.

This image is still experimental [Lab].

## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin) 

To build the project go up 3 directories to be at the root of this project.
Then run :

```
./gradlew :nifi-1.9.2:buildImage
```

If you want to test the image you can run :
```
./gradlew :nifi-1.9.2:testImage
```

### Using docker commands

First go to context/version sub-directory :

```
cd nifi-1.9.2
```

Then run the following command:
```
docker build -t saagie/nifi-1.9.2 .
```
     
## Run RStudio container

### On Saagie's Platform 

This container is supposed to be run on Saagie's platform.

Official documentation is available here : [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html)

### On premise / your local server

Anyway, it is possible mainly for development and tests to run this image outside Saagie.
Please note that Saagie won't provide any support regarding images launched outside it's platform.

Simply run: 
```
docker run --rm -it -p 10080:8080 --name nifi -e SAAGIE_BASE_PATH=/ -t saagie/nifi:1.9.2
```

## Pending questions :
 - How to handle site to site communication
 - How to query API from external location
 - How to save and persist templates (some say they are saved in nifi `conf` folder under `flow.xml.gz`)
 - How to authenticate and manage several different users
