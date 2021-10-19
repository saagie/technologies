#!/bin/bash

set -xeo pipefail

if [[ -z "${MLFLOW_BACKEND_STORE_URI}" ]]; then
  echo "ERROR : MLFLOW_BACKEND_STORE_URI environment variable must be set"
  echo "Usage : MLFLOW_BACKEND_STORE_URI = database-backed store as SQLAlchemy database URI <dialect>+<driver>://<username>:<password>@<host>:<port>/<database> MLflow supports the database dialects mysql, mssql, sqlite, and postgresql."
  exit 1
elif [[ -z "${MLFLOW_DEFAULT_ARTIFACTORY_ROOT}" ]]; then
  echo "ERROR : MLFLOW_DEFAULT_ARTIFACTORY_ROOT environment variable must be set"
  echo "Usage : MLFLOW_DEFAULT_ARTIFACTORY_ROOT = default location to server’s artifact store (e.g. hdfs://cluster:8020/artifactory/mlflow )"
  exit 1
else
  echo "Starting MLflow Server"
  mlflow server \
    --backend-store-uri ${MLFLOW_BACKEND_STORE_URI} \
    --default-artifact-root ${MLFLOW_DEFAULT_ARTIFACTORY_ROOT} \
    --host 0.0.0.0
fi