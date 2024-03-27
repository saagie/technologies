## How to launch Spark History Server?

To make Spark History Server work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variable</a>:

    | Name                          | Value                                                                                                                                                              | 
    |-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `SPARK_HISTORY_EVENT_LOG_DIR` | This is the directory where event log information is saved. The default location is `hdfs://cluster/tmp/spark-events`. You can specify it according to your needs. |

***
> _For more information on Spark History Server, see the <a href="https://spark.apache.org/docs/latest/monitoring.html" target="_blank">official documentation</a>._

<!-- ## How to build the image in local?

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `spark-history-server-x.y` folder corresponding to your version, `technologies/app/spark-history-server/<version>`. Use the `cd` command.
2. Run the following command lines:
    ```bash
    docker build -t saagie/spark-history-server:<tag> .
    docker push saagie/spark-history-server-<tag>
    ```
    Where `<tag>` must be replaced with the version number or identifier you want to use for your image. -->