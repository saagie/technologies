# Cloudbeaver - customized by Saagie

This Docker image is officially available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/cloudbeaver) and is based on the official [dbeaver/cloudbeaver:1.2.0](https://hub.docker.com/r/dbeaver/cloudbeaver/) image.

It is specially designed to run on Saagie's platform v2.

## Build the image

You can build the image with either Gradle or Docker.

Gradle builds take place in the root of the project as a whole.
Docker builds take place in the directory for the individual technology.

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin).

To build the project, go to the root of this project.
Then run:

```
./gradlew :cloudbeaver:buildImage
```

If you want to test the image, you can run:
```
./gradlew :cloudbeaver:testImage
```

### Using Docker commands

First go to context/version sub-directory for the minimal image of the technology:

```
cd technologies/app/cloudbeaver/cloudbeaver-1.2.0
```

Then run the following command:
```
docker build -t saagie/cloudbeaver:1.2.0 .
```
     
## Run container

### On Saagie's Platform 

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html)

### On premise / your local server

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

Run: 

```
docker run -it --rm --name cloudbeaver -p 18080:80 -e SAAGIE_BASE_PATH="/cloudbeaver" saagie/cloudbeaver:1.2.0	
```

Then you'll be able to access Cloudbeaver at (http://localhost:18080/cloudbeaver/).

