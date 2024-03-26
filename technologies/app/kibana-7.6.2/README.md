> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/kibana" target="_blank">Saagie’s DockerHub</a> and is based on the official Kibana Docker image, <a href="https://www.elastic.co/guide/en/kibana/current/docker.html" target="_blank">docker.elastic.co/kibana/kibana:7.6.2</a>.

## How to launch Kibana?

To make Kibana work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variable</a>:

    | Name                  | Value                                                                                   | 
    |-----------------------|-----------------------------------------------------------------------------------------|
    | `ELASTICSEARCH_HOSTS` | This is the Elasticsearch host.<br/>For example, `http://my_elasticsearch_server:9200`. |

    Note that some versions have a different value for the `rewriteUrl` parameter in their `context.yaml` file. It can be set to `rewriteUrl : true`. In this case, you must replace the `ELASTICSEARCH_HOSTS` environment variable with `ELASTICSEARCH_URL`.
   
***
> _For more information on Kibana, see the <a href="https://www.elastic.co/guide/en/kibana/index.html" target="_blank">official documentation</a>_

<!-- ## How to build the image in local?

### Using the Gradle Build 

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :kibana-7.6.2:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :kibana-7.6.2:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `kibana-x.y` folder corresponding to your version, `technologies/app/kibana/kibana-7.6.2`. Use the `cd` command.
2. Run the following command:
    ```bash
    docker build -t saagie/kibana-7.6.2 .
    ```
     
## How to run the image?

### On Saagie's Platform

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Kibana needs to connect to an elasticsearch server that matches its version. Therefore, you must set the following environment variables:
   - `ELASTICSEARCH_HOSTS` 
   - `SERVER_BASEPATH` 
 
2. Run the following command. It will launch a Docker container with the Kibana version and configurations that you want to use.
    ```bash
    docker run --rm -it -p 5601:5601 --name kibana -e SERVER_BASEPATH=/kibana -e ELASTICSEARCH_HOSTS="https://w.x.y.z:port/" saagie/kibana:7.6.2
    ```
   Where `https://w.x.y.z:port/` must be replaced with the actual URL of your Elasticsearch server. Or an array of addresses in the case of a cluster.
3. Access your local image at `http://localhost:5601/kibana`. -->