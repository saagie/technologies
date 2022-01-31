#!/bin/bash

set -xeo pipefail

echo """
INFO : 'MLFLOW_BACKEND_STORE_URI' variable is mandatory and must be set as SQLAlchemy database URI:
INFO : <dialect>+<driver>://<username>:<password>@<host>:<port>/<database> (MLflow supports the database dialects mysql, mssql, sqlite, and postgresql)
INFO : example: mysql://login:password@192.168.56.30:3306/db_name
INFO : Notice: The Database must be created before launching MlFlow

INFO : MLFLOW_DEFAULT_ARTIFACTORY_ROOT:  variable is mandatory and must be set to an HDFS directory (default directory: e.g. hdfs://cluster:8020/artifactory/mlflow )
INFO : Notice: The HDFS directory must be created before launching MlFlow

INFO : If you hae any request don't hesitate to create an issue in this gitlab: https://github.com/saagie/technologies
INFO : Did you take a look to our community repository? https://github.com/saagie/technologies-community
"""

if [[ -z ${MLFLOW_BACKEND_STORE_URI} || -z ${MLFLOW_DEFAULT_ARTIFACTORY_ROOT} ]]; then
  echo
  """
  ERROR : Missing environment variable. In order to work, this app needs the following environment variables set : 
  MLFLOW_BACKEND_STORE_URI and MLFLOW_DEFAULT_ARTIFACTORY_ROOT

  Usage : 'MLFLOW_BACKEND_STORE_URI' variable is mandatory and must be set as SQLAlchemy database URI:
  Usage : <dialect>+<driver>://<username>:<password>@<host>:<port>/<database> (MLflow supports the database dialects mysql, mssql, sqlite, and postgresql)
  Usage : example: mysql://login:password@192.168.56.30:3306/db_name
  Usage : Notice: The Database must be created before launching MlFlow

  INFO : MLFLOW_DEFAULT_ARTIFACTORY_ROOT:  variable is mandatory and must be set to an HDFS directory (default directory: e.g. hdfs://cluster:8020/artifactory/mlflow )
  Usage : The HDFS directory must be created before launching MlFlow
  """
  exit 1
fi


echo "Starting MLflow Server"
mlflow server \
  --backend-store-uri ${MLFLOW_BACKEND_STORE_URI} \
  --default-artifact-root ${MLFLOW_DEFAULT_ARTIFACTORY_ROOT} \
  --host 0.0.0.0
