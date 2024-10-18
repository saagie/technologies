from tools.tools import get_realm_from_url, get_app_logs, list_objects_with_prefix, split_info
from saagieapi import SaagieApi
import os
import logging
import time
from datetime import datetime
import boto3
from pathlib import Path

def createStorageForRestoring(
        client_saagie, 
        project_id, 
        date_backup,
        restore_date,
        path,
        path_info
    ):

    volume = next((item['volume'] for item in path_info if item['path'] == '/'+path), None)

    logging.info(f"==========================================================> volume : {volume}")

    volume_size=volume['size']
    volume_name=volume['name']
    logging.info(f"===>volume_size : {volume_size}")
    logging.info(f"===>volume_name : {volume_name}")

    logging.info(f'********* Creating volume {volume_name}  *********')
    storage_name = f'{volume_name} restored volume {date_backup} from backup {restore_date} at {datetime.now()}'
    response_create_storage = client_saagie.storages.create(
        project_id=project_id,
        storage_name= storage_name,
        storage_size=volume_size,
        storage_description= storage_name
    )
    createdVolumeId = response_create_storage['createVolume']['id']
    logging.info(f"===>restored_storage_id : {createdVolumeId}")

    return createdVolumeId

def script_restore():
    ##############################################################################################
    # liste des apps à restored SAAGIE_APP_RESTORE_LIST_APP_ID
    if os.environ.get('SAAGIE_APP_RESTORE_LIST_APP_ID'):
        list_app = os.environ['SAAGIE_APP_RESTORE_LIST_APP_ID'].split(',')
    else:
        logging.warning("==> SAAGIE_APP_RESTORE_LIST_APP_ID à paramétrer")
        return False

    # date du backup
    if os.environ.get('RESTORE_DATE'):
        restore_date = os.environ['RESTORE_DATE']
    else:
        logging.warning("==> RESTORE_DATE à paramétrer")
        return False

    init_timeout = int(os.environ.get("SAAGIE_APP_BACKUP_TIMEOUT_RESTORE", 600))
    timeout = init_timeout
    backup_app_project_id = os.environ["SAAGIE_APP_BACKUP_CURRENT_APP_PROJECT_ID"]
    finished_status = ["STOPPED", "FAILED", "UNKNOWN"]

    APP_RESTORE_VERSION = os.environ.get("APP_RESTORE_VERSION", '2024.04-0.1-1.192.0_SDKTECHNO-271')

    app_restore_baseName = 'saagie/saagie-app-storages-sub-app-restore'
    app_restore_name = f'{app_restore_baseName}:{APP_RESTORE_VERSION}'
    logging.info(f"app_restore_name: {app_restore_name}")

    # Get information to connect to Saagie
    logging.info(f"Connect to Saagie ")
    url = os.getenv('SAAGIE_APP_BACKUP_SAAGIE_URL', 'https://saagie-tech.saagie.io')
    platform_login = os.getenv('SAAGIE_APP_BACKUP_SAAGIE_USER', 'tech_user')
    platform_pwd = os.getenv('SAAGIE_APP_BACKUP_SAAGIE_PWD', 'tech_user')
    realm = get_realm_from_url(url)
    pf = os.getenv('SAAGIE_APP_BACKUP_PF_ID', '1')

    logging.info(f"---- {url=}")
    logging.info(f"---- {platform_login=}")
    logging.info(f"---- {realm=}")
    logging.info(f"---- {pf=}")

    # Instantiate the Saagie API client
    client_saagie = SaagieApi(url_saagie=url,
                              id_platform=pf,
                              user=platform_login,
                              password=platform_pwd,
                              realm=realm)

    s3_client = boto3.client("s3",
                             endpoint_url=os.environ["SAAGIE_APP_BACKUP_S3_ENDPOINT"],
                             region_name=os.environ["SAAGIE_APP_BACKUP_S3_REGION_NAME"],
                             aws_access_key_id=os.environ["SAAGIE_APP_BACKUP_S3_ACCESS_KEY_ID"],
                             aws_secret_access_key=os.environ["SAAGIE_APP_BACKUP_S3_SECRET_ACCESS_KEY"])
    s3_bucket_name = os.environ["SAAGIE_APP_BACKUP_S3_BUCKET_NAME"]


    for app_id in list_app:
        logging.info("======================")
        logging.info(f"App to restored: [{app_id}]")
        app_info = client_saagie.apps.get_info(app_id)['app']
        app_to_restore_project_id = app_info['project']['id']
        client_saagie.env_vars.create_or_update(
            scope="PROJECT",
            name="SAAGIE_APP_BACKUP_CURRENT_APP_PROJECT_ID",
            value=app_to_restore_project_id,
            project_id=app_to_restore_project_id
        )

        logging.info(f"App to restore project ID: [{app_to_restore_project_id}]")

        # Check if the backup exist
        list_paths_backup = list_objects_with_prefix(s3_client, s3_bucket_name, prefix=f"{app_to_restore_project_id}/{app_id}")
        if not list_paths_backup:
            logging.info(f"No backup found for the app [{app_id}]")
            continue

        # Get the path of the volumes
        path_info = app_info['currentVersion']['volumesWithPath']
        app_dict = {}
        for path in path_info:
            volume_size = path['volume']['size']
            volume_path = path['path']
            app_dict[volume_path] = volume_size

        logging.info(f"app_dict: {app_dict}")
        logging.info(f"list_paths_backup: {list_paths_backup}")
        # Split the information
        backup_infos= split_info(list_paths_backup, app_dict)

        logging.info(f"backup_infos[restore_date]: {backup_infos[restore_date]}")
        logging.info(f"backup_infos: {backup_infos}")
        logging.info(f"path_info: {path_info}")

        logging.info(f"backup date: {restore_date}")

        storage_paths = []

        for path in backup_infos[restore_date]:
            logging.info(f"Restoring {path} for app [{app_id}]")
            logging.info(f"path before if: {path}")
            s3_file_prefix = str(Path(f"{app_to_restore_project_id}/{app_id}/{restore_date}/{path}"))
            if "/"+path not in app_dict:
                logging.warning(f"Volume path: {path} not found in the app")
                continue
            logging.info(f"Volume path: {path} - Volume size: {app_dict['/'+path]}")

            id_volume = ""
            
            logging.info(f"===>path : {path}")
            logging.info(f"===>path_info : {path_info}")

            now = datetime.now()
            date_backup = now.strftime('%Y-%m-%d')
            id_volume = createStorageForRestoring(client_saagie, backup_app_project_id, date_backup, restore_date, path, path_info)

            # Create env vars
            logging.info(f"----- Creating necessary environment variables ...")
            restore_tmp_app_prefix = os.environ['SAAGIE_APP_RESTORE_TMP_APP_PREFIX']

            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="SAAGIE_APP_RESTORE_STORAGE_FOLDER",
                value="/"+path,
                description="Path directory on image",
                project_id=backup_app_project_id
            )

            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="SAAGIE_APP_RESTORE_S3_PREFIX",
                value=s3_file_prefix,
                project_id=backup_app_project_id
            )

            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="SAAGIE_APP_RESTORE_TMP_APP_PREFIX",
                value=restore_tmp_app_prefix,
                project_id=backup_app_project_id
            )


            # Create a temporary app to restore the backup
            app_name = f"{restore_tmp_app_prefix} {datetime.timestamp(now)}"

            # Create the tmp app
            logging.info(f"----- Creating the tmp app for restore [{app_name}] in project {backup_app_project_id} ...")
            create_app_info = client_saagie.apps.create_from_scratch(
                project_id=backup_app_project_id,
                app_name=app_name,
                image=app_restore_name,
                exposed_ports=[
                    {
                        "basePathVariableName": "SAAGIE_BASE_PATH",
                        "isRewriteUrl": True,
                        "scope": "PROJECT",
                        "number": 8080,
                        "name": "unused port"
                    }
                ],
                storage_paths=[
                    {"path": "/"+path,
                     "volumeId": id_volume
                     }
                ]
            )
            # Get ID of tmp app
            app_tmp_id = create_app_info["createApp"]["id"]

            # Get tmp app info
            app_tmp_info = client_saagie.apps.get_info(app_tmp_id)

            tmp_app_finished = app_tmp_info["app"]["history"]["currentStatus"] in finished_status

            # Waiting for the temporary app to finish
            while not tmp_app_finished:
                logging.info("------ Waiting for the restore tmp app to finished ...")
                time.sleep(10)
                tmp_app_finished = client_saagie.apps.get_info(app_tmp_id)["app"]["history"]["currentStatus"] in finished_status
                timeout -= 10
                if timeout <= 0:
                    logging.error(
                        f"Temporary APP [{app_name}] with ID [{app_tmp_id}] is not terminated after {init_timeout // 60} minutes, "
                        f"the current status is {client_saagie.apps.get_info(app_tmp_id)['app']['history']['currentStatus']}")
                    return False
            
            logging.info(f"Getting temporary APP currentExecutionId: [{app_name}] with ID [{app_tmp_id}]")
            current_execution_id = client_saagie.apps.get_info(app_id=app_tmp_id)['app']['history']['currentExecutionId']
            
            logging.info(f"Getting temporary APP logs: [{app_name}] with ID [{app_tmp_id} and currentExecutionId {current_execution_id}]")
            app_logs = get_app_logs(client_saagie,app_tmp_id,current_execution_id)['appLogs']['content']
            logging.info(f"*********** {app_name} logs *************>>>>>")
            for logs in app_logs : 
                logging.info(f"{logs['value']}")
            logging.info(f"<<<<<*********** {app_name} logs *************")
            
            logging.info(f"Deleting the temporary APP: [{app_name}] with ID [{app_tmp_id}]")
            client_saagie.apps.delete(app_tmp_id)

            logging.info(f"{path} restored for app [{app_id}]")

            if not app_to_restore_project_id == backup_app_project_id :
                logging.info(f"====> Déplacement du volume vers le projet où se trouve son app ...")
                move_to = client_saagie.storages.move(storage_id=id_volume, target_platform_id=pf, target_project_id=app_to_restore_project_id)
                logging.info(f"retour move new id:{move_to['moveVolume']}")
                id_volume = move_to['moveVolume']
            else :
                logging.info(f"====> Volume already in the same project as the app to restore...")

            storage_paths.append({"path": "/"+path, "volumeId": id_volume})

        logging.info(f"Upgrade the app [{app_id}] with the restored volumes {storage_paths}")
        response = client_saagie.apps.upgrade(
            app_id=app_id,
            storage_paths=storage_paths
        )
        logging.info(f"reponse_upgrade: {response}")
    return True
