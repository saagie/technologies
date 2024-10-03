from tools.tools import get_realm_from_url, get_app_logs, list_objects_with_prefix, split_info
from saagieapi import SaagieApi
import os
import logging
import time
from datetime import datetime
import boto3
from pathlib import Path


def script_restore():
    ##############################################################################################
    # liste des apps à restored RESTORE_LIST_APP_ID
    if os.environ.get('RESTORE_LIST_APP_ID'):
        list_app = os.environ['RESTORE_LIST_APP_ID'].split(',')
    else:
        logging.warning("==> RESTORE_LIST_APP_ID à paramétrer")
        return False

    # date du backup
    if os.environ.get('RESTORE_DATE'):
        restore_date = os.environ['RESTORE_DATE']
    else:
        logging.warning("==> RESTORE_DATE à paramétrer")
        return False


    # TODO: define a timeout
    init_timeout = 600
    timeout = 600
    finished_status = ["STOPPED", "FAILED", "UNKNOWN"]
    d = datetime.now()


    # Get information to connect to Saagie
    logging.info(f"Connect to Saagie ")
    url = os.getenv('BACKUP_URL', 'https://saagie-tech.saagie.io')
    platform_login = os.getenv('BACKUP_USER', 'tech_user')
    platform_pwd = os.getenv('BACKUP_PWD', 'tech_user')
    realm = get_realm_from_url(url)
    pf = os.getenv('BACKUP_PF_ID', '1')

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
                             endpoint_url=os.environ["BACKUP_S3_ENDPOINT"],
                             region_name=os.environ["BACKUP_REGION_NAME"],
                             aws_access_key_id=os.environ["BACKUP_S3_ACCESS_KEY_ID"],
                             aws_secret_access_key=os.environ["BACKUP_S3_SECRET_ACCESS_KEY"])
    s3_bucket_name = os.environ["BACKUP_S3_BUCKET_NAME"]


    for app_id in list_app:
        logging.info("======================")
        logging.info(f"App to restored: [{app_id}]")
        app_info = client_saagie.apps.get_info(app_id)['app']
        project_id = app_info['project']['id']
        client_saagie.env_vars.create_or_update(
            scope="PROJECT",
            name="BACKUP_APP_PROJECT_ID",
            value=project_id,
            project_id=project_id
        )

        logging.info(f"Project ID: [{project_id}]")

        # Check if the backup exist
        list_paths_backup = list_objects_with_prefix(s3_client, s3_bucket_name, prefix=f"{project_id}/{app_id}")
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
        # Split the information
        backup_infos= split_info(list_paths_backup)

        logging.info(f"backup date: {restore_date}")
        # for path in backup_infos[max_date_str]:
        for path in backup_infos[restore_date]:
            logging.info(f"path before if: {path}")
            # s3_file_prefix = str(Path(f"{project_id}/{app_id}/{max_date_str}/{path}"))
            s3_file_prefix = str(Path(f"{project_id}/{app_id}/{restore_date}/{path}"))
            if "/"+path not in app_dict:
                logging.warning(f"Volume path: {path} not found in the app")
                continue
            logging.info(f"Volume path: {path} - Volume size: {app_dict['/'+path]}")

            id_volume = ""
            # Create the volume (Anne)
            # Harmoniser la variable d = datetime.now()
            #d = datetime.now()
            date_backup = d.strftime('%Y-%m-%d')
            volume_size=client_saagie.apps.get_info(app_id)['app']['currentVersion']['volumesWithPath']
            for volume in volume_size:
                volume_size=volume['volume']['size']
                volume_name=volume['volume']['name']
                # logging.info(f"Volume path: {path} - Volume size: {app_dict[path]}")
                logging.info(f"===>volume_size : {volume_size}")
                logging.info(f"===>volume_name : {volume_name}")

                response_crete_storage = client_saagie.storages.create(
                    project_id=project_id,
                    storage_name= volume_name + " restored volume " + date_backup + " from backup " + restore_date,
                    storage_size=volume_size,
                    storage_description= volume_name + " restored volume du " + date_backup + " from backup " + restore_date
                )
                logging.info('*****')
                logging.info(f"===>restored_storage_id : {response_crete_storage['createVolume']['id']}")
                id_volume=response_crete_storage['createVolume']['id']


            # Create env vars
            logging.info(f"----- Creating necessary environment variables ...")
            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="RESTORE_STORAGE_FOLDER",
                value="/"+path,
                description="Path directory on image",
                project_id=project_id
            )

            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="RESTORE_S3_PREFIX",
                value=s3_file_prefix,
                project_id=project_id
            )

            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="RESTORE_TMP_APP_PREFIX",
                value=os.environ["RESTORE_TMP_APP_PREFIX"],
                project_id=project_id
            )


            # Create a temporary app to restore the backup
            #d = datetime.now()
            app_name = f"{os.environ['RESTORE_TMP_APP_PREFIX']} {datetime.timestamp(d)}"

            # Create the tmp app
            logging.info(f"----- Creating the tmp app for restore [{app_name}] ...")
            create_app_info = client_saagie.apps.create_from_scratch(
                project_id=project_id,
                app_name=app_name,
                image="annelhomme/restore:1.1", # TODO: change this value when you have push the image in saagie's docker hub
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
                logging.info("------ Waiting for the backup tmp app to finished ...")
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
            logging.info(f"*********** {app_name} logs *************")
            for logs in app_logs : 
                logging.info(f"{logs['value']}")
            logging.info("***************************")
            
            logging.info(f"Deleting the temporary APP: [{app_name}] with ID [{app_tmp_id}]")
            client_saagie.apps.delete(app_tmp_id)

            logging.info(f"Upgrade the app [{app_id}]")
            response = client_saagie.apps.upgrade(
                app_id=app_id,
                storage_paths=[
                    {
                        "path": "/"+path,
                        "volumeId": id_volume
                    }
                ]
            )
            logging.info(f"reponse_upgrade: {response}")

            return True
