> [!NOTE] 
> This Docker image is based on the official Python 3.7 Docker image and comes with OpenJDK 8 and Hadoop 2.6 libraries to connect to HDFS and push the different artifacts.

## How to launch MLflow Server?

To make MLflow Server work on your platform, you must meet the following requirements.

1. On your Saagie platform, create the following <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variables</a>:

    | Name                              | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 
    |-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `MLFLOW_BACKEND_STORE_URI`        | This is the tracking URI of the <a href="https://mlflow.org/docs/latest/tracking/backend-stores.html" target="_blank">backend store</a>. Here, the backend store is a database that persists various metadata for each <a href="https://mlflow.org/docs/latest/tracking.html#runs" target="_blank">Run</a>. Acceptable URIs are SQLAlchemy-compatible database connection strings encoded as `<dialect>+<driver>://<username>:<password>@<host>:<port>/<database>`. MLflow supports the dialects `mysql`, `mssql`, `sqlite`, and `postgresql`. For more information, see <a href="https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls" target="_blank">SQLAlchemy Database URLs</a>. |
    | `MLFLOW_DEFAULT_ARTIFACTORY_ROOT` | This is the default location to the server’s <a href="https://mlflow.org/docs/latest/tracking/artifacts-stores.html" target="_blank">artifact store</a>.<br/>For example, `hdfs://cluster:8020/artifactory/mlflow`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
2. <a href="https://docs.saagie.io/user/latest/data-team/projects-module/apps/managing-apps#apps-install" target="_blank">Create your app</a>.
3. Create the following environment variable:

    | Name                  | Value                                        | 
    |-----------------------|----------------------------------------------|
    | `MLFLOW_TRACKING_URI` | This is the URL of the app you just created. |
4. Run your app.
</br>You can now access your app at `https://<saagie-url>/app/<project-id>/5000/`.

> [!TIP]
> Here is a code example with a `sklearn` model training for a Python job:
> ```python
> mlflow.set_tracking_uri(os.environ["MLFLOW_TRACKING_URI"])
> os.environ["MLFLOW_TRACKING_INSECURE_TLS"]="true"
> 
> def train_rf_sklearn(nb_estimator,criterion, exp_id):
>     with mlflow.start_run(experiment_id=exp_id):
>         clf = RandomForestClassifier(n_estimators=nb_estimator, criterion=criterion)
>         clf.fit(train_x, train_y.values.ravel())
>         predicted_surviving = clf.predict(test_x)
> 
>         score_accuracy = accuracy_score(test_y, predicted_surviving)
>         score_f1 = f1_score(test_y, predicted_surviving)
> 
>         print("  Accuracy: %s" % score_accuracy)
>         print("  F1: %s" % score_f1)
>         artifact_path = mlflow.get_artifact_uri()
>         print("  Artifact path: %s" % artifact_path)
> 
>         mlflow.log_param("n_estimators", nb_estimator)
>         mlflow.log_param("criterion", criterion)
>         mlflow.log_metric("accuracy", score_accuracy)
>         mlflow.log_metric("f1", score_f1)
>         mlflow.sklearn.log_model(clf, 'Sklearn')
> ```
> You can find more examples in the <a href="https://github.com/saagie/technologies/tree/master/technologies/app/mlflow-server/example" target="_blank">`./example`</a> folder to get you started with MLflow. 

***
> _For more information on MLflow, see the <a href="https://www.mlflow.org/docs/latest/index.html" target="_blank">official documentation</a>._


<!-- ## How to build the image in local?

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the `mlflow-server-x.y` folder corresponding to your version, `technologies/app/mlflow-server/<version>`. Use the `cd` command.
2. Run the following command lines:
    ```bash
    docker build -t saagie/mlflow-server:<version> .
    docker push saagie/mlflow-server:<version>
    ```
    Where `<version>` must be replaced with the version number.

## Versionning 

The MLflow Server Docker image is tagged with the following format: `<mlflow version>-<saagie revision>`. Where: 
- MLflow version: This is the version of the [MLflow release](https://github.com/mlflow/mlflow/releases).
- Saagie revision : This is the version of this Docker image in the Saagie context.

For example, the third revision for Saagie of the MLflow Server v1.13 will have the following image: `saagie/mlflow-server:1.13-3.0`.

### How to update your MLflow version?

To build a new MLflow version for Saagie, follow the steps below. 

1. Check the [release notes](https://github.com/mlflow/mlflow/releases) to make sure that the new release does not introduce breaking changes.
2. Change the release number in the Dockerfile by running the following command line:
    ```docker
    RUN pip install git+https://github.com/saagie/mlflow.git@vX.Y.Z
    ```
3. Build the image.
4. Test it out locally.
5. Push it if the tests are OK.
6. Update the `metadata.yaml` file to reference this new tag.
7. Update your catalog on Saagie with the updated metadata file.

> [!WARNING] 
> Your Mlflow server will fail against a backend store with an obsolete database schema. To avoid this, upgrade your database schema to the latest supported version using `mlflow db upgrade [db_uri]`. Schema migrations may cause database downtime, may take longer on larger databases, and are not guaranteed to be transactional. You should always make a backup of your database before running `mlflow db upgrade`. Consult your database documentation to find out how to make a backup.
-->