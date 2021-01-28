# Dash - customized by Saagie

This Docker image is available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/dash) is based on the official [python:3.8-slim](https://hub.docker.com/_/python) image.

It is specially designed to run on Saagie's V2 platform.

It adds a few features, such as:
* Automatically checkout a git project located at : **${DASH_GIT_URL_REPOSITORY}**
* By default checkout the **master** branch
* If provided checkout branch : **${DASH_GIT_BRANCH}**
* Then install files in app **requirements.txt** files 
* And finally launches **app.py**


## Build the image

### Using gradle build

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin).

To build the project, go to the root of this project.
Then run:

```
./gradlew :dash:buildImage
```

If you want to test the image, you can run:
```
./gradlew :dash:testImage
```

### Using docker commands

First go to context/version sub-directory:

```
cd dash
```

Then run the following command:
```
docker build -t saagie/dash:2.0.0 .
```

## Run Dash container

### On Saagie's Platform

This container is designed to run on Saagie's platform.

The official documentation is available here: [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html).

### On premise / your local server

It is possible (mainly for development and testing) to run this image outside of a Saagie platform.
Please note that Saagie cannot provide any support for images launched outside of its platform.

Run:
```
docker run --rm -it -p 18050:8050 --name dash -e SAAGIE_BASE_PATH=/ -e DASH_GIT_URL_REPOSITORY=git@github.com:user/repo.git saagie/dash:2.0.0
```

- Port `8050` should be mapped to the one you will be using on host side (here `18050`).
- `SAAGIE_BASE_PATH` variable is **mandatory** and should be equal to / . It's used to customize the path to the application when behind a reverse proxy.
- `DASH_GIT_URL_REPOSITORY` variable is also **mandatory** and should be set to the name of the git repository continning your dash app source code.
- `DASH_GIT_BRANCH` is optional and defaulted to master, it indicates a specific branch to checkout.

# IMPORTANT NOTE

Your Dash App should expose itself to the world, so please check that app.py in Dash app should have host set to 0.0.0.0

e.g.:
```
if __name__ == "__main__":
    app.run_server(debug=True, host='0.0.0.0')
```