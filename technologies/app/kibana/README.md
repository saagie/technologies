# Kibana - customized by Saagie

This Docker image is available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/kibana) and is based on the official [docker.elastic.co/kibana/kibana:7.15.1](https://www.elastic.co/guide/en/kibana/current/docker.html) image.

It is designed to run on Saagie's V2 platform.

# Environment Variables
There are 1 mandatory environment variable : 
 - `ELASTICSEARCH_HOSTS` (eg : http://my_elasticsearch_server:9200)


## Build the image locally

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin). 

To build the project, go to the root of this project.
Then run:

```
./gradlew :kibana-7.15.1:buildImage
```

If you want to test the image, you can run:
```
./gradlew :kibana-7.15.1:testImage
```

### Using docker commands

First go to context/version sub-directory:

```
cd kibana-7.15.1
```

Then run the following command:
```
docker build -t saagie/kibana-7.15.1 .
```
     
### On Saagie's Platform

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html).

### On your local machine

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

As kibana need to connects to an elasticsearch server matching it's version you must provide the following environment variables :
 - `ELASTICSEARCH_HOSTS` 
 - `SERVER_BASEPATH` 
 
Run: 
```
docker run --rm -it -p 5601:5601 --name kibana -e SERVER_BASEPATH=/kibana -e ELASTICSEARCH_HOSTS="https://my_elasticsearch_server:port/" saagie/kibana:7.15.1
```
where my_elasticsearch_server must be replaced by the elasticsearch server IP adress (or an array of adresses in case of a cluster)

Then go to http://localhost:5601/kibana.

## Specificities

There are versions with a different value in context.yaml : `rewriteUrl: true`

More over the `ELASTICSEARCH_HOSTS` variable must be referenced as `ELASTICSEARCH_URL` 