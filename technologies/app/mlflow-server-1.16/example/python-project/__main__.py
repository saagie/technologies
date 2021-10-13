import os
import random
import string
import sys

import mlflow
import mlflow.sklearn
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


def train_rf_sklearn(nb_estimator, criterion, exp_id):
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


# Read data
filepath = "data/demo_mlflow/train.csv"
data = pd.read_csv("./train.csv", sep=",")

train, test = train_test_split(data)

train_x = train.drop(["Survived", "PassengerId", "Name", "Ticket"], axis=1)
test_x = test.drop(["Survived", "PassengerId", "Name", "Ticket"], axis=1)
train_y = train[["Survived"]]
test_y = test[["Survived"]]

# Fill NA/NaN values
train_x['Age'].fillna((train_x['Age'].mean()), inplace=True)
test_x['Age'].fillna((test_x['Age'].mean()), inplace=True)

# Making a new feature hasCabin which is 1 if cabin is available else 0
train_x['hasCabin'] = train_x.Cabin.notnull().astype(int)
test_x['hasCabin'] = test_x.Cabin.notnull().astype(int)
train_x.drop(["Cabin"], axis=1, inplace=True)
test_x.drop(["Cabin"], axis=1, inplace=True)

# Fill Na/NaN values with the most frequent value
train_x['Embarked'].fillna("S", inplace=True)
test_x['Embarked'].fillna("S", inplace=True)

le1 = LabelEncoder()
train_x["Sex"] = le1.fit_transform(train_x["Sex"])
test_x["Sex"] = le1.fit_transform(test_x["Sex"])
le2 = LabelEncoder()
train_x["Embarked"] = le2.fit_transform(train_x["Sex"])
test_x["Embarked"] = le2.fit_transform(test_x["Sex"])

os.environ["MLFLOW_TRACKING_INSECURE_TLS"]="true"

nb_estimator = int(sys.argv[1])
criterion = "entropy"
exp_name = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
exp_id = mlflow.create_experiment(exp_name)
if mlflow.active_run():
    mlflow.end_run()
train_rf_sklearn(nb_estimator, criterion, exp_id)
