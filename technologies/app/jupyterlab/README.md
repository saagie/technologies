> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/jupyter-python-nbk" target="_blank">Saagie’s DockerHub</a> and is based on the official Jupyter Docker Stacks image, <a href="https://hub.docker.com/r/jupyter/minimal-notebook/" target="_blank">FROM jupyter/minimal-notebook:f9e77e3ddd6f</a>.
> 
> This Docker image relies on a first minimal image based on the official Jupyter image, plus some features required by the Saagie platform. It then provides the Saagie base image of Jupyter using the minimal image and includes all the Python libraries of the Saagie Python image.

## How to install libraries?

The Jupyter app provided by Saagie already includes many libraries. They are listed below. 

However, if you need other libraries, install them by running the following command line:

```
!pip install libraryName
```
Where `libraryName` must be replaced with the name of the desired library.

> _For more information, see [Saagies' Jupyter base image ](../jupyter/README.md)._

## How to build the image in local?

You can build the image with Gradle or Docker.
- Gradle builds take place at the root of the project.
- Docker builds take place in the technology specific directory.

### Using the Gradle Build

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :jupyterlab:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :jupyterlab:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the technology version subdirectory `technologies/app/jupyterlab/jupyterlab-base` using the `cd` command.
2. Run the following command:
    ```bash
    docker build -t saagie/jupyterlab-python-nbk:3.8-3.9-base .
    ```
   It builds your intermediate minimal image.
3. Navigate to the technology version directory `technologies/app/jupyterlab`:
    ```bash
    cd ../jupyterlab
    ```
4. Run the following command:
    ```bash
    docker build --build-arg BASE_CONTAINER=saagie/jupyterlab-python-nbk:3.8-3.9-base -t saagie/jupyterlab-python-nbk:3.8-3.9 .
    ```

## How to run the image?

### On Saagie's Platform 

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the Jupyter version and configurations that you want to use.
    ```bash
    docker run --rm --name jupyter -p 18888:8888 -v /path/to/persisten/folder/jupyter-workdir:/notebooks-dir saagie/jupyterlab:3.8-3.9-base	
    ```
   Where:
   - Port `8888` must be mapped to the port you will use on the host side. For example, `18888`.
   - The `SAAGIE_BASE_PATH` environment variable is **optional** when you run the app manually.
   - The `-v /path/to/persistent/folder/jupyter-workdir:/notebooks-dir` parameter is **optional**. It mounts the local directory `/path/to/persistent/folder/jupyter-workdir` on the host into the directory `/notebooks-dir` inside the container. This allows you to keep data between container runs, such as Jupyter notebooks and files. If you need to use this parameter, you must:
     - Create your local directory with `mkdir -p /path/to/persistent/folder/jupyter-workdir`.
     - Make Jovyan, the default Jupyter Notebook user, the owner of this directory with `chown -R 1000:1000 /path/to/persistent/folder/jupyter-workdir`.
2. Access your local image at `http://localhost:18888`.