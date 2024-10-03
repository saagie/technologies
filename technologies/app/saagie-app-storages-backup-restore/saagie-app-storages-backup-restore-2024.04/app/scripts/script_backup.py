from tools.tools import get_realm_from_url, get_app_logs
from saagieapi import SaagieApi
import os
import logging
import time
from datetime import datetime


def script_backup():
    ##############################################################################################
    # liste des apps à sauvegarder BACKUP_LIST_APP_ID

    if os.environ.get('BACKUP_LIST_APP_ID'):
        list_app = os.environ['BACKUP_LIST_APP_ID'].split(',')
    else:
        logging.warning("==> BACKUP_LIST_APP_ID à paramétrer")
        return False

    # TODO: define a timeout
    init_timeout = 600
    timeout = 600
    project_id = os.environ["BACKUP_APP_PROJECT_ID"]
    finished_status = ["STOPPED", "FAILED", "UNKNOWN"]

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


    for app_id in list_app:
        logging.info("======================")
        logging.info(f"App to backup: [{app_id}]")
        # DeprecatedWarning: get_info is deprecated as of 2.10.0. This function is deprecated and will be removed in a future version. Please use :func:`get()` instead.
        app_info = client_saagie.apps.get_info(app_id)['app']
        if not app_info:
            logging.warning(f"App [{app_id}] not found")
            continue

        logging.info(f"From project : [{app_info['project']['id']} : {app_info['project']['name']}]")
        app_to_backup_project_id = app_info['project']['id']

        logging.info("Stop the app if it is running ")
        flag_app_was_up = False
        if app_info['history']['currentStatus'] not in finished_status:
            flag_app_was_up = True
            client_saagie.apps.stop(app_id=app_id)
            logging.info(f"App stopped: [{app_id}]")
        else:
            logging.info(f"App already stopped: [{app_id}]")

        logging.info(f"Volumes linked to the current version : ")

        app_finished = app_info["history"]["currentStatus"] in finished_status

        # Wait for stopping app
        while not app_finished:
            time.sleep(10)
            app_finished = client_saagie.apps.get_info(app_id)["app"]["history"]["currentStatus"] in finished_status
            timeout -= 10
            if timeout <= 0:
                logging.error(
                    f"APP [{app_id}] is not terminated after {timeout // 60} minutes")
                return False
        timeout = init_timeout

        dict_volume = {}
        # Duplicates all volume of the app
        for volume in app_info["currentVersion"]["volumesWithPath"]:
            logging.info("========================================")
            volume_name = volume['volume']['name']
            volume_path = volume['path']
            volume_id = volume['volume']['id']
            volume_size = volume['volume']['size']
            logging.info(f"------ {volume_name=}")
            logging.info(f"------ {volume_id=}")
            logging.info(f"------ {volume_path=}")
            logging.info(f"------ {volume_size=}")

            logging.info(f"Duplicating the volume: ")
            duplicate_response = client_saagie.storages.duplicate(storage_id=volume['volume']['id'])

            # Get duplicate volume ID
            duplicate_volume_id = duplicate_response['duplicateVolume']['id']
            logging.info(f"------ {duplicate_volume_id=}")

            # Check if the volume is successfully duplicated
            logging.info(f"------ Volume to check: [{volume_path}] with ID [{duplicate_volume_id}]")
            while client_saagie.storages.get(storage_id=duplicate_volume_id)["volume"]["isLocked"]:
                logging.info("------ Waiting for the duplication ...")
                time.sleep(10)
                timeout -= 10
                if timeout <= 0:
                    logging.error(f"The storage [{volume_path}] with ID [{duplicate_volume_id}] is"
                                       f" not duplicated after {init_timeout//60} minutes")
                    return False

            logging.info(f"------ The storage [{volume_path}] with ID [{duplicate_volume_id}] is successfully duplicated")
            # Reset timeout
            timeout = init_timeout
            # Vérifier si l'app est dans le même projet que l'addOn, déplacer les volumes duppliqués pour les monter sur lapp_tempo sinon
            if not app_to_backup_project_id == project_id : 
                logging.info(f"====> Déplacement du volume vers le projet où se trouve l'addOn ...")
                move_to = client_saagie.storages.move(storage_id=duplicate_volume_id, target_platform_id=pf, target_project_id=project_id)
                logging.info(f"retour move new id:{move_to['moveVolume']}")
                duplicate_volume_id = move_to['moveVolume']
            else : 
                logging.info(f"====> Pas besoin de déplacer le volume")

            dict_volume[volume_path] = {"size": volume_size, "id": duplicate_volume_id}

        logging.info(f"All volumes is successfully duplicated")

        # Restart the app si elle était up
        if flag_app_was_up :
            logging.info(f"Restart the app [{app_info['id']}]")
            client_saagie.apps.run(app_id=app_info['id'])


        # Create a new app with the duplicated storage and store it on S3
        for volume in dict_volume:
            logging.info(f"Backup of the volume")
            duplicate_volume_id = dict_volume[volume]["id"]
            logging.info(f"----- The path of the volume is {volume}")
            logging.info(f"----- The size of the volume is {dict_volume[volume]['size']}")
            logging.info(f"----- The id of the volume is {dict_volume[volume]['id']}")

            # Create the backup folder
            d = datetime.now()
            date_backup = d.strftime('%Y-%m-%d')
            # modif à faire => dans le chemin sur le S3, le project_id doit etre celui de l app à backuper
            # s3_file_prefix = project_id + '/' + app_id + '/' + date_backup
            s3_file_prefix = app_to_backup_project_id + '/' + app_id + '/' + date_backup
            logging.info(f"----- The path prefix of the backup will be: {s3_file_prefix}")

            # Create env vars
            logging.info(f"----- Creating necessary environment variables ...")
            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="BACKUP_STORAGE_FOLDER",
                value=volume,
                description="Path directory on image",
                project_id=project_id
            )

            client_saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="BACKUP_S3_PREFIX",
                value=s3_file_prefix,
                project_id=project_id
            )
            app_name = f"{os.environ['BACKUP_TMP_APP_PREFIX']} {datetime.timestamp(d)}"

            # Create the tmp app
            logging.info(f"----- Creating the tmp app [{app_name}] ...")
            create_app_info = client_saagie.apps.create_from_scratch(
                project_id=project_id,
                app_name=app_name,
                image="qiwei1000/app_tmp:1.4", # TODO: change this value when you have push the image in saagie's docker hub
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
                    {"path": volume,
                     "volumeId": duplicate_volume_id
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
            current_execution_id=client_saagie.apps.get_info(app_id=app_tmp_id)['app']['history']['currentExecutionId']
            
            logging.info(f"Getting temporary APP logs: [{app_name}] with ID [{app_tmp_id} and currentExecutionId {current_execution_id}]")
            app_logs = get_app_logs(client_saagie,app_tmp_id,current_execution_id)['appLogs']['content']
            logging.info(f"*********** {app_name} logs *************")
            for logs in app_logs : 
                logging.info(f"{logs['value']}")
            logging.info("***************************")


            logging.info(f"Deleting the temporary APP: [{app_name}] with ID [{app_tmp_id}]")
            client_saagie.apps.delete(app_tmp_id)

            # Delete the duplicated storage
            logging.info(f"Deleting the duplicated storage {duplicate_volume_id}")
            client_saagie.storages.delete(storage_id=duplicate_volume_id, project_id=project_id)

            return True

