## How to launch Saagie Usage Monitoring (SUM)?

To make SUM work on your platform, you must meet the following requirements.

1. Verify that your user has at least the viewer rights on all projects.
2. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

    | Name                                                                                                | Value                                                                                                                                                                                                                                                                                                                                                    | 
    |-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `SAAGIE_SUPERVISION_LOGIN`                                                                          | This is your username.                                                                                                                                                                                                                                                                                                                                   |
    | `SAAGIE_SUPERVISION_PASSWORD`                                                                       | This is your password.                                                                                                                                                                                                                                                                                                                                   |
    | `SAAGIE_URL`                                                                                        | This is the URL of the Saagie platform.<br/>For example, `https://saagie-workspace.prod.saagie.io`.                                                                                                                                                                                                                                                      |
    | `SAAGIE_PLATFORM_ID`                                                                                | This is the ID of your plateform.<br/>→ The default value is `1`.                                                                                                                                                                                                                                                                                        |
    | `MONITORING_OPT`                                                                                    | This is to define what you want to monitor. The possible values are:<br/>- `SAAGIE` if you only want to monitor your Saagie jobs, apps, and pipelines.<br/>- `SAAGIE_AND_DATALAKE` if you want to monitor Saagie and your HDFS data lake.<br/>- `SAAGIE_AND_S3` if you want to monitor Saagie and your S3 buckets.<br/>→ The default value is  `SAAGIE`. |
    | `IP_HDFS`                                                                                           | This is the IP of the namenode. This environment variable is required if you set the `MONITORING_OPT` environment variable to `SAAGIE_AND_DATALAKE`.                                                                                                                                                                                                     |
    | - `AWS_ACCESS_KEY_ID`<br/>- `AWS_SECRET_ACCESS_KEY`<br/>- `AWS_S3_ENDPOINT`<br/>- `AWS_REGION_NAME` | These four environment variables are required if you set the `MONITORING_OPT` environment variable to `SAAGIE_AND_S3`.                                                                                                                                                                                                                                   |
3. **OPTIONAL**: Create the following environment variable to allow Cron to collect data from Saagie on the API:

    | Name              | Value                                                                                                 | 
    |-------------------|-------------------------------------------------------------------------------------------------------|  
    | `SAAGIE_SUM_CRON` | It allows Cron to collect information from Saagie on the API.<br/>→ The default value is `0 * * * *`. |
4. **OPTIONAL**: By default, alerts are sent via emails. If you want to enable SMTP alerts, you must have an SMTP server that will receive these alerts and you must set the following environment variables in Saagie:

    | Name                   | Value                                                                     | 
    |------------------------|---------------------------------------------------------------------------|
    | `GF_SMTP_ENABLED`      | This is to enable SMTP alerts.<br/>→ The default value is  `false`.       |
    | `GF_SMTP_HOST`         | This is the SMTP host and port.                                           |
    | `GF_SMTP_USER`         | This is the your SMTP user.                                               |
    | `GF_SMTP_PASSWORD`     | This is the your SMTP password.                                           |
    | `GF_SMTP_FROM_ADDRESS` | This is the email address of the alert sender.                            |
    | `GF_SMTP_SKIP_VERIFY`  | This is to skip SSL for SMTP server.<br/>→ The default value is  `false`. |
5. **OPTIONAL**: If you want to use an external PostgreSQL database, you must define the connection parameters via the corresponding environment variables in Saagie:

    | Name                 | Value                                                                              | 
    |----------------------|------------------------------------------------------------------------------------|
    | `SAAGIE_PG_HOST`     | This is your PostgreSQL host.<br/>→ The default value is  `localhost`.             |
    | `SAAGIE_PG_PORT`     | This is your PostgreSQL port.<br/>→ The default value is  `5432`.                  |
    | `SAAGIE_PG_USER`     | This is your PostgreSQL user.<br/>→ The default value is  `supervision_pg_user`.   |
    | `SAAGIE_PG_PASSWORD` | This is your PostgreSQL password.<br/>→ The default value is  ` `.                 |
    | `SAAGIE_PG_DATABASE` | This is your PostgreSQL database.<br/>→ The default value is  `supervision_pg_db`. |

***
> _For more information, see our documentation on <a href="https://docs.saagie.io/user/latest/data-team/add-on-module/saagie-usage-monitoring/" target="_blank">Saagie Usage Monitoring</a>._