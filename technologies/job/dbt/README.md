# DBT CLI

With the dbt cli technology, you can build/run/test your dbt project just by uploading a zip containing your dbt project.

## Description

This technology contains the `dbt-core` library as well as the adapters for : 
- Redshift 
- Big Query
- Snowflake
- PostgreSQL
- Spark

The default behavior of this technology is to unzip the archive containing the dbt project you uploaded in Saagie and to run this project with the following command
```
dbt run --profiles-dir .
```
Feel free to update the command line with whatever dbt command you need to launch.
