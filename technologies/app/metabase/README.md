> [!NOTE] 
> This version of Metabase is bundled with Impala and Athena drivers.
> 
> It comes with a local H2 table to store Metabase’s internal data. You can configure environment variables to use it with an external MySQL or PostgreSQL table. For more information on how to configure Metabase, see the <a href="https://www.metabase.com/docs/latest/configuring-metabase/environment-variables" target="_blank">documentation on environment variables</a>.

## How to launch Metabase?

To make Metabase work on your platform, you must meet the following requirements.

1. Create the default admin credentials the first time you log in.
2. **OPTIONAL**: If you want to use Athena, add the following connection string when configuring Athena in Metabase: `UseResultsetStreaming=0`.

***
> _For more information on Metabase, see the <a href="https://www.metabase.com/docs/latest/" target="_blank">official documentation</a>._

<!-- ## How to build the image in local?

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `metabase-x.y` folder corresponding to your version, `technologies/app/metabase/<version>`. Use the `cd` command.
2. Run the following command lines:
    ```
    docker build --build-arg METABASE_VERSION=<version> -t saagie/metabase:<version> .
    docker push saagie/metabase:<version>
    ```
    Where `<version>` must be replaced with the version number. -->