# OrientDB - customized by Saagie

This Docker image is available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/orientdb) is based on the official [openjdk:8-jre-slim](https://hub.docker.com/_/openjdk) image.

It is specially designed to run on Saagie's V2 platform.

If you need persistence, the volume should at least have 256Mb of space.


## Build the image

### Using gradle build

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin).

To build the project, go to the root of this project.
Then run:

```
./gradlew :orientdb-3.1.7:buildImage
```

If you want to test the image, you can run:
```
./gradlew :orientdb-3.1.7:testImage
```

### Using docker commands

First go to context/version sub-directory:

```
cd orientdb-3.1.7
```

Then run the following command:
```
docker build -t saagie/orientdb:3.1.7 .
```

## Run OrientDB container

### On Saagie's Platform

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html).

### On premise / your local server

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

Run:
```
docker run -it --rm --name orientdb -p 19480:9480 -p 19424:9424 -e ORIENTDB_WEB_PATH=/http -e ORIENTDB_BINARY_PATH=/binary -e ORIENTDB_ROOT_PASSWORD=yourPassword saagie/orientdb:3.1.7-1.77.0_apporientdb
```

- Port `9480` should be mapped to the one you will be using on host side (here `19480`) for web access.
- Port `9424` should be mapped to the one you will be using on host side (here `19424`) for binary access.
- `ORIENTDB_WEB_PATH` variable is **mandatory** and defines a specific path for web access, it can be /. It's used to customize the path to the application when behind a reverse proxy.
- `ORIENTDB_BINARY_PATH` variable is **mandatory** and defines a specific path bor binary access, it can be /. It's used to customize the path to the application when behind a reverse proxy.
- `ORIENTDB_ROOT_PASSWORD` variable is also **mandatory** and should be set to whatever you'll be using as a password to access OrientDB, here `yourPassword`

Databases are under /orientdb/databases
Configuration is under /orientdb/config
Logs are under /orientdb/log

Configure persistence according to your needs.