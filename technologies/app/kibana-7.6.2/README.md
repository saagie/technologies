# Kibana - customized by Saagie

This Docker image officially available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/kibana) is based on official [docker.elastic.co/kibana/kibana:7.6.2](https://www.elastic.co/guide/en/kibana/current/docker.html) image.

It is specially designed to run on Saagie's platform v2.


## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin) 

To build the project go up 3 directories to be at the root of this project.
Then run :

```
./gradlew :kibana-7.6.2:buildImage
```

If you want to test the image you can run :
```
./gradlew :kibana-7.6.2:testImage
```

### Using docker commands

First go to context/version sub-directory :

```
cd kibana-7.6.2
```

Then run the following command:
```
docker build -t saagie/kibana-7.6.2 .
```
     
## Run RStudio container

### On Saagie's Platform 

This container is supposed to be run on Saagie's platform.

Official documentation is available here : [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html)

### On premise / your local server

Anyway, it is possible mainly for development and tests to run this image outside Saagie.
Please note that Saagie won't provide any support regarding images launched outside it's platform.

As kibana need to connects to an elasticsearch server matching it's version you must provide the following environment variables :
 - `ELASTICSEARCH_HOSTS` 
 - `SERVER_BASEPATH` 
 
Simply run: 
```
docker run --rm -it -p 5601:5601 --name kibana -e SERVER_BASEPATH=/kibana -e ELASTICSEARCH_HOSTS="https://w.x.y.z:port/" saagie/kibana:7.6.2
```
where w.x.y.z must be replaced by the elasticsearch server IP adress (or an array of adresses in case of a cluster)

Then go to http://localhost:5601/kibana 