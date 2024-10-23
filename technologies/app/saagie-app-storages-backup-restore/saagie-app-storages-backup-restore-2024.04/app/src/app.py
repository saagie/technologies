# pylint: disable=line-too-long
import os
import boto3
from dash import Dash, callback, Input, Output, Patch, ctx

from tools.tools import *
from scripts import script_restore, script_backup

from views import get_body_app, render_tabs
from configs import *

# Connect to S3
s3_client = boto3.client("s3",
                         endpoint_url=os.environ["SAAGIE_APP_BACKUP_S3_ENDPOINT"],
                         region_name=os.environ["SAAGIE_APP_BACKUP_S3_REGION_NAME"],
                         aws_access_key_id=os.environ["SAAGIE_APP_BACKUP_S3_ACCESS_KEY_ID"],
                         aws_secret_access_key=os.environ["SAAGIE_APP_BACKUP_S3_SECRET_ACCESS_KEY"])

# Check if the bucket exist, if not create it
bucket_exist = [True for bucket in s3_client.list_buckets()["Buckets"] if bucket["Name"] == s3_bucket_name]
if not bucket_exist:
    logging.info(f"Bucket [{s3_bucket_name}] does not exist, creating it")
    s3_client.create_bucket(Bucket=s3_bucket_name)

# to run on Saagie Platform
# eviter les erreurs sur les call back définie en dehors du rendu principal
app = Dash("AddOn Backup/Restore",
           url_base_pathname=os.environ["SAAGIE_BASE_PATH"] + "/",
           suppress_callback_exceptions=True)

app.title = "Saagie Backup/Restore apps storages"
app.layout = get_body_app()

########################################## Tabs ##########################################
@callback(
    Output('tabs-content', 'children'),
    Input('tabs', 'value')
)
def render_content(tab):
    list_paths_backup = get_list_paths_backup(s3_client)
    return render_tabs(tab, list_paths_backup)

########################################## Callbacks RESTORE ##########################################
def launch_restore():
    logging.info(f"----- Launch of restore script ...")
    restore_result = script_restore.script_restore(s3_client)
    logging.info(f"----- End of restore script ...")
    return restore_result

#### selection de l'app à restaurer ####
@callback(
    Output("date-select", "data"),
    Output("date-select", "disabled"),
    Input("app-select", "value"),
    prevent_initial_call=True
)
def select_value(value_app):
    # construction d'un dictionnaire contenant toutes les dates de backup pour chaque app_id
    list_paths_backup = get_list_paths_backup(s3_client)
    list_dates_backup = list_path_to_dict(list_paths_backup)

    dates = []
    if not value_app == None:
        for project_id, apps_list in list_dates_backup.items():
            for app_id in apps_list.keys():
                if value_app == app_id:
                    dates = apps_list[app_id]
        disabled = False
    else:
        dates = []
        disabled = True

    return dates, disabled


@callback(
    Output("submit-restore", "disabled"),
    Input("date-select", "value"))
def select_value(value):
    return value == None


#### BOUTON RESTORE ####
@callback(
    Output("info-restore", "children"),
    Output("action-return", "children", allow_duplicate=True),
    Output("notification", "style", allow_duplicate=True),
    Output("app-link", "href"),

    Input(component_id='app-select', component_property='value'),
    Input(component_id='date-select', component_property='value'),
    Input(component_id='submit-restore', component_property='n_clicks'),
    prevent_initial_call=True
)
def prepare_restore(value_app, value_date, n_clicks):
    patched_children = Patch()
    if ctx.triggered_id == "submit-restore":
        # recupération de l'app_id à restaurer
        logging.info(f"value_app=  {value_app}")
        # recupération de la date du backup à restaurer
        logging.info(f"value_date=  {value_date}")
        # mise à jour des envvar
        message = ""

        if value_app and len(value_app) > 0:
            #########################################################
            # maj de l'envvar en local
            print(f"local SAAGIE_APP_RESTORE_LIST_APP_ID before update: {os.environ.get('SAAGIE_APP_RESTORE_LIST_APP_ID')}")
            os.environ['SAAGIE_APP_RESTORE_LIST_APP_ID'] = value_app
            test = os.environ['SAAGIE_APP_RESTORE_LIST_APP_ID']
            print(f"local SAAGIE_APP_RESTORE_LIST_APP_ID after update: {test}")

            print(f"local RESTORE_DATE before update: {os.environ.get('RESTORE_DATE')}")
            os.environ['RESTORE_DATE'] = value_date
            test = os.environ['RESTORE_DATE']
            print(f"local RESTORE_DATE after update: {test}")

            #########################################################
            # maj de l'envvar projet
            logging.info(f"----- Updating environment variables SAAGIE_APP_RESTORE_LIST_APP_ID...")
            logging.info(f"pf_id : {pf}")
            saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="SAAGIE_APP_RESTORE_LIST_APP_ID",
                value=value_app,
                description="List of apps to backup",
                project_id=backup_project_id
            )
            logging.info(f"----- End updating environment variables SAAGIE_APP_RESTORE_LIST_APP_ID")

            logging.info(f"----- Updating environment variables RESTORE_DATE...")
            logging.info(f"pf_id : {pf}")
            saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="RESTORE_DATE",
                value=value_date,
                description="Date of selected backup to restore",
                project_id=backup_project_id
            )
            logging.info(f"----- End of updating environment variables RESTORE_DATE")

            url_app = url + "/projects/platform/" + str(pf) + "/project/" + backup_project_id + "/app/" + value_app
            print(f"url_app :{url_app}")

            result = launch_restore()
            message = "An error occurred during the restore process"
            if result:
                message = f"App {value_app} restored to date of {value_date}"
            else:
                message = f"An error occurred during the restore process for app {value_app} to date of {value_date}: see logs of backup-restore app for more details"

            return message, message, {'display': 'block'}, url_app
    return "", "", {'display': 'none'}, ""



########################################## Callbacks BACKUP ##########################################
def launch_backup():
    logging.info(f"----- Launch of backup script ...")
    script_backup.script_backup(s3_client)
    logging.info(f"----- End du script_backup ...")

#### filtre checkbox ####
@callback(
    Output("apps_table", "dashGridOptions"),
    Input("input-filter", "value"),
)
def update_filter(filter_value):
    gridOptions_patch = Patch()
    gridOptions_patch["quickFilterText"] = filter_value
    return gridOptions_patch


#### LISTE DES APPS ####
@callback(
    Output(component_id='submit-val', component_property="disabled"),
    Input(component_id='apps_table', component_property='selectedRows'),
)
def show_selected_app(selectedRows):
    return len(selectedRows) <= 0


#### BOUTON BACKUP ####
@callback(
    Output("apps_table", "selectedRows"),
    # test ajout notification
    Output("action-return", "children", allow_duplicate=True),
    Output("notification", "style", allow_duplicate=True),

    Input(component_id='apps_table', component_property='selectedRows'),
    Input(component_id='apps_table', component_property='rowData'),
    Input(component_id='submit-val', component_property='n_clicks'),
    prevent_initial_call=True
)
def prepare_backup(selectedRows, rowData, n_clicks):
    message_notification = ""
    if ctx.triggered_id == "submit-val":
        # The button has been clicked, values is a list containing the active checklist values
        # do something with values
        # return something 
        # - afficher la liste des apps qui seront backupées dans la div 'selected-app'
        # - mettre à jour la variable d'env SAAGIE_APP_BACKUP_LIST_APP_ID => comment trouver l'id du projet de l app courrante ?
        # - lancer le script script_backup/__main__.py

        list_selected_apps = []
        for row in selectedRows:
            list_selected_apps.append(row["app_id"])
        backup_list_app_id = ",".join(str(app_id) for app_id in list_selected_apps)
        if len(backup_list_app_id) > 0:
            #########################################################
            # maj de l'envvar en local
            print(f"local SAAGIE_APP_BACKUP_LIST_APP_ID before update: {os.environ.get('SAAGIE_APP_BACKUP_LIST_APP_ID', '')}")
            os.environ['SAAGIE_APP_BACKUP_LIST_APP_ID'] = backup_list_app_id
            test = os.environ['SAAGIE_APP_BACKUP_LIST_APP_ID']
            print(f"local SAAGIE_APP_BACKUP_LIST_APP_ID after update: {test}")

            #########################################################
            # maj de l'envvar projet
            logging.info(f"----- Updating environment variables SAAGIE_APP_BACKUP_LIST_APP_ID...")
            logging.info(f"pf_id : {pf}")
            saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="SAAGIE_APP_BACKUP_LIST_APP_ID",
                value=backup_list_app_id,
                description="List of apps to backup",
                project_id=backup_project_id
            )
            logging.info(f"----- End updating environment variables SAAGIE_APP_BACKUP_LIST_APP_ID")

            launch_backup()
            message_notification = 'The selected app(s) "{}" has(ve) been backuped '.format(backup_list_app_id)

            return [], message_notification, {'display': 'block'}
        message_notification = 'No app selected '
        return selectedRows, message_notification, {'display': 'none'}
    return selectedRows, message_notification, {'display': 'none'}


#### NOTIFICATION ####
@callback(
    Output("action-return", "children", allow_duplicate=True),
    Output("notification", "style", allow_duplicate=True),

    Input(component_id='btn-close-notification', component_property='n_clicks'),
    prevent_initial_call=True
)
def hide_notification(n_clicks):
    message = ""
    display = {'display': 'none'}
    return message, display


if __name__ == "__main__":
    # PROD
    # app.run_server(host="0.0.0.0", debug=False, port=8050)
    # DEV
    app.run_server(host="0.0.0.0", debug=True, port=8050)
