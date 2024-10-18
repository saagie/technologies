import logging

from gql import gql
import re
import pandas as pd
from datetime import datetime


def get_app_logs(saagie, app_id, app_execution_id):
    GQL_APPS = """
        query appLogsQuery($appId: UUID!,$appExecutionId: UUID!) {
          appLogs(appId:$appId,appExecutionId:$appExecutionId) {
            content{value}
          }
        }
    """
    return saagie.client.execute(gql(GQL_APPS), variable_values={"appId": app_id,
                                                                 "appExecutionId": app_execution_id})


def get_realm_from_url(url):
    """
    Extract the realm from a Saagie platform URL.

    Args:
        url (str): Saagie platform URL.

    Returns:
        str: The extracted realm.
    """
    realm = url.split("-")[0]
    realm = realm.replace("https://", "")
    return realm


def list_objects_with_prefix(s3_client, bucket_name, prefix):
    """
    List all objects with a specific prefix in a given S3 bucket.

    Parameters:
        bucket_name (str): The name of the S3 bucket.
        prefix (str): The prefix to filter objects.

    Returns:
        list: A list of object keys matching the prefix.
    """
    # Initialize an empty list to store object keys
    object_keys = []

    # Pagination logic to handle large number of objects
    paginator = s3_client.get_paginator('list_objects_v2')
    for result in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
        if 'Contents' in result:
            for obj in result['Contents']:
                object_keys.append(obj['Key'])

    return object_keys


def split_info(list_path, path_volume):
    """

    :param list_path:
    :return:
    """
    informations = {}

    for chemin in list_path:
        logging.info(f"chemin: {chemin}")
        
        for volume in path_volume:
            escaped_pattern = re.escape(volume[1:])
            logging.info(f"escaped_pattern: {escaped_pattern}")

            regex = rf'.*/(\d{{4}}-\d{{2}}-\d{{2}})/({escaped_pattern})/.*'
            logging.info(f"regex: {regex}")
            match = re.match(regex, chemin)

            logging.info(f"match: {match}")
            if match:
                date = match.group(1)
                chemin_complet = match.group(2)
                logging.info(f"chemin_complet: {chemin_complet}")

                # Création de la structure de données si elle n'existe pas encore
                if date not in informations:
                    informations[date] = []
                if chemin_complet not in informations[date]:
                    informations[date].append(chemin_complet)

    # Affichage des informations
    for date, paths in informations.items():
        logging.info(f"Date: {date}")
        for path in paths:
            logging.info(f"   Chemin: {path}")

    return informations


def list_projects(saagie, list_max_dates_backup, url, pf):
    """
    List of all app with a volume
    :param saagie: SaagieApi instance,
    :param list_max_dates_backup: dict,
    :param url: string,
    :param pf: string,
    :return: pd.Dataframe
    """

    result = []
    for project in saagie.projects.list()['projects']:
        project_list_infos_app = saagie.apps.list_for_project(project_id=project["id"])['project']['apps']

        for app in project_list_infos_app:
            url_app = url + "/projects/platform/" + str(pf) + "/project/" + project["id"] + "/app/" + app["id"]
            if app["id"] in list_max_dates_backup.keys():
                last_backup = list_max_dates_backup[app["id"]]
            else:
                last_backup = "None"

            # on ne liste que les apps qui ont un volume lié
            if app["linkedVolumes"]:
                if len(app["linkedVolumes"]) > 0:
                    result.append({"projet": project["name"],
                                   "project_id": project["id"],
                                   "app_name": app["name"],
                                   "app_url": url_app,
                                   "app_id": app["id"],
                                   "last_backup": last_backup
                                   }
                                  )
    return pd.DataFrame(result)


def list_path_to_dict(list_path):
    """

    :param list_path:
    :return:
    """
    # Initialisation du dictionnaire pour stocker les informations
    projects_dict = {}
    apps_list = {}

    # Boucle sur chaque chemin
    for chemin in list_path:
        # Utilisation de l'expression régulière pour extraire les informations
        match = re.match(r'.*/(\d{4}-\d{2}-\d{2})/(.+?)/', chemin)
        if match:
            date = match.group(1)
            chemin_complet = match.group(2)
            split_chemin = chemin.split(date)

            project_id = split_chemin[0].split('/')[0]
            app_id = split_chemin[0].split('/')[1]

            # Création de la structure de données si elle n'existe pas encore
            if project_id not in projects_dict:
                projects_dict[project_id] = {}

            if app_id not in projects_dict[project_id]:
                projects_dict[project_id][app_id] = []

            if date not in projects_dict[project_id][app_id]:
                projects_dict[project_id][app_id].append(date)

    return projects_dict


def get_max_date_list(projects_dict):
    list_max_dates_backup = {}
    for project_id, apps_list in projects_dict.items():
        for app_id, dates in apps_list.items():
            max_date = max([datetime.strptime(date, "%Y-%m-%d") for date in dates])
            max_date_str = max_date.strftime("%Y-%m-%d")

            # Création de la structure de données si elle n'existe pas encore
            if app_id not in list_max_dates_backup:
                list_max_dates_backup[app_id] = max_date_str

    return list_max_dates_backup


def get_select_data(saagie, projects_dict):
    result = []
    # récupération de la liste des projets de la pf
    projects_list = saagie.projects.list()['projects']

    for project_id, apps_list in projects_dict.items():
        # on parcourt la liste des projets de la pf pour trouver le nom
        for project in projects_list:
            if project_id == project["id"]:
                project_name = project['name']

        # récupération de la liste des infos des apps du projet du dictionnaire des backups sur la pf
        project_list_infos = saagie.apps.list_for_project(project_id=project_id)
        project_list_infos_app = []
        if (project_list_infos is not None) & (project_list_infos['project'] is not None):
            project_list_infos_app = project_list_infos['project']['apps']

            list_apps_select = []
            # on parcourt la liste des apps du  dictionnaire des backups
            for app_id in apps_list.keys():
                # Pour chaque app du projet du dictionnaire des backups on parcourt la liste des infos app du projet en cours
                for app in project_list_infos_app:
                    # quand on trouve l'id de l app dans la liste, on recupère le nom dans les infos
                    if app_id == app["id"]:
                        list_apps_select.append({"value": app["id"], "label": project_name + " | " + app["name"]})

            result.append(
                {
                    "group": project_name,
                    "items": list_apps_select
                }
            )
    return result
