# MLflow Server

## Description

This directory contains a version of MLflow server containerized and customized for Saagie Platform.
Official documentation for MLFlow can be found [here](https://www.mlflow.org/docs/latest/index.html).

This image is built from a **Python 3.7** official image and comes with : 
- OpenJDK8
- Hadoop 2.6 libraries in order to connect to HDFS (to push the different artifacts)


## Build

### How to build it

Inside the **mlflow-server** folder, run :

```shell
docker build -t saagie/mlflow-server:<version> .
docker push saagie/mlflow-server:<version>
```

### Versionning 

The MLFlow Server docker image is tagged with the following format `<mlflow version>-<saagie revision>` where 
- mlflow version : version of the [MLflow release](https://github.com/mlflow/mlflow/releases)
- Saagie revision : version of this docker image in the Saagie context

For instance, the 3rd revision fior Saagie of the MLFlow Server v1.13 will have the following image : `saagie/mlflow-server:1.13-3.0`

### Updating MLFlow version

Whenever you want to build a new MLFlow version for Saagie : 

1. Check the [release notes](https://github.com/mlflow/mlflow/releases) and make sure the new release does not introduce breaking changes.
2. Change the release number in the Dockerfile

```docker
RUN pip install git+https://github.com/saagie/mlflow.git@vX.Y.Z
```

3. Build it
4. Test it locally
5. Push it if the tests are OK
6. Update the **metadata.yaml** file to reference this new tag
7. Update your catalog on Saagie with the up to date metadata file


| :warning: |  Mlflow server will fail against a database-backed store with an out-of-date database schema. To prevent this, upgrade your database schema to the latest supported version using mlflow db upgrade [db_uri]. Schema migrations can result in database downtime, may take longer on larger databases, and are not guaranteed to be transactional. You should always take a backup of your database prior to running mlflow db upgrade - consult your database’s documentation for instructions on taking a backup.  |
|-----------------|:-------------|

## Run

### Deploying

Several environment variables should be set to run the MLflow server:

- **MLFLOW_BACKEND_STORE_URI**: database-backed store as SQLAlchemy database URI `<dialect>+<driver>://<username>:<password>@<host>:<port>/<database>` MLflow supports the database dialects mysql, mssql, sqlite, and postgresql.
- **MLFLOW_DEFAULT_ARTIFACTORY_ROOT** : default location to server’s artifact store (e.g. `hdfs://cluster:8020/artifactory/mlflow` )

Once you have created an application with the MLflow server, don't forget to set the **MLFLOW_TRACKING_URI** environment variable with the url of the application you just created.

### Accessing

Once deploed on Saagie, your MLFlow Server instance can be accessed at `https://<saagie-url>/app/<project-id>/5000/`

### Using it in your code

Example with a sklearn model training : 

```python
mlflow.set_tracking_uri(os.environ["MLFLOW_TRACKING_URI"])
os.environ["MLFLOW_TRACKING_INSECURE_TLS"]="true"

def train_rf_sklearn(nb_estimator,criterion, exp_id):
    with mlflow.start_run(experiment_id=exp_id):
        clf = RandomForestClassifier(n_estimators=nb_estimator, criterion=criterion)
        clf.fit(train_x, train_y.values.ravel())
        predicted_surviving = clf.predict(test_x)

        score_accuracy = accuracy_score(test_y, predicted_surviving)
        score_f1 = f1_score(test_y, predicted_surviving)

        print("  Accuracy: %s" % score_accuracy)
        print("  F1: %s" % score_f1)
        artifact_path = mlflow.get_artifact_uri()
        print("  Artifact path: %s" % artifact_path)

        mlflow.log_param("n_estimators", nb_estimator)
        mlflow.log_param("criterion", criterion)
        mlflow.log_metric("accuracy", score_accuracy)
        mlflow.log_metric("f1", score_f1)
        mlflow.sklearn.log_model(clf, 'Sklearn')
```



In the **./example** folder you can find the full example (the Python app and a Notebook file) to get you started on MLFlow.
