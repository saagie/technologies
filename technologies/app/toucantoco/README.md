# Toucantoco - customized by Saagie

This Docker image privately available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/toucantoco) 
is based on official toucantoco v76.0 private images.

It is specially designed to run on Saagie's platform v2.

It aggregates under a single container :
  - Toucantoco frontend
  - Toucantoco backend
  - Redis server
  - Mongodb server

## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin) 

To build the project go up 3 directories to be at the root of this project.
Then run :

```
./gradlew :toucantoco:buildImage
```

If you want to build and test the image you can run :
```
./gradlew :toucantoco:testImage
```

If you want to only re-run test once the image has already been built successfully :
```
./gradlew :toucantoco:buildWaitContainer
```

### Using docker commands

First go to context/version sub-directory :

```
cd toucantoco-76.0
```

Then run the following command:
```
docker build -t saagie/toucantoco:76.0 .
```

## Run Toucantoco container

### On Saagie's Platform 

This container is supposed to be run on Saagie's platform.

Official documentation is available here : [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html)

### On premise / your local server

Anyway, it is possible mainly for development and tests to run this image outside Saagie.
Please note that Saagie won't provide any support regarding images launched outside it's platform.

Simply run: 
```
docker run -d --rm --name toucan 
    -p 8090:8090 
    -p 8080:8080 
    -e PROXY_PATH=/ 
    -e FRONT_PATH=/front 
    -e BACK_PATH=/back 
    -e TOUCAN_HOST=http://my.host
    -e TOUCAN_FRONT_PORT=:8080 
    -e TOUCAN_BACK_PORT=:8090 
    -e TOUCAN_DB_ENCRYPTION_SECRET="MyTokenSuperSecret" 
    -v $PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/mongo:/data 
    -v $PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/storage:/app/storage 
    <image-name>
```

Then you'll be able to access Toucantoco at http://myhost:8080 using the default user (login: `toucantoco`, password: `hakunamatata`).
Mounting a volumes to `/app/storage` and `/data` directories allows you to persist Toucantoco user projects and settings. 
Meaning the `-v $PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/mongo:/data` and `-v $PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/storage:/app/storage` part are optional but can be useful.
