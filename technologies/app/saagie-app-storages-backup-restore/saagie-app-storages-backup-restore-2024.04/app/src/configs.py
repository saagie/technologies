import os
from tools.tools import *
from saagieapi import SaagieApi

def get_list_paths_backup(s3_client):
    # récupération de la liste des chemins dans le bucket
    list_paths_backup = list_objects_with_prefix(s3_client, s3_bucket_name, prefix=f"")
    if not list_paths_backup:
        logging.info(f"No backup found")
    return list_paths_backup

def get_list_max_dates_backup(list_paths_backup):
    # construction d'un dictionnaire contenant toutes les dates de backup pour chaque app_id
    list_dates_backup = list_path_to_dict(list_paths_backup)
    # construction d'un dictionnaire contenant uniquement la max_date de backup pour chaque app_id
    return get_max_date_list(list_dates_backup)

url = os.environ['SAAGIE_APP_BACKUP_SAAGIE_URL']
pf = os.environ['SAAGIE_APP_BACKUP_PF_ID']
platformLogin = os.environ['SAAGIE_APP_BACKUP_SAAGIE_USER']
platformPwd = os.environ['SAAGIE_APP_BACKUP_SAAGIE_PWD']
realm = get_realm_from_url(url)
endpoint_url = os.environ["SAAGIE_APP_BACKUP_S3_ENDPOINT"]
region_name = os.environ["SAAGIE_APP_BACKUP_S3_REGION_NAME"]
s3_bucket_name = os.environ["SAAGIE_APP_BACKUP_S3_BUCKET_NAME"]  # Bucket name on S3, e.g. saagie-backup
backup_project_id = os.environ["SAAGIE_APP_BACKUP_CURRENT_APP_PROJECT_ID"]  # id du projet où est hébergé l'addOn

saagie = SaagieApi(url_saagie=url, id_platform=pf, user=platformLogin, password=platformPwd, realm=realm)
# récupération des infos du projet où se trouve l'app backup
info_projet_backup = saagie.projects.get_info(project_id=backup_project_id)['project']
print(f"{info_projet_backup=}")
#####################################################################################
# si les infos contiennent "None" => on n'est pas sur la bonne plateforme
if info_projet_backup == None:
    print(f"pf =  {pf}")
    if pf == 1:
        pf = 2
    else:
        pf = 1
    saagie = SaagieApi(url_saagie=url, id_platform=str(pf), user=platformLogin, password=platformPwd, realm=realm)
    info_projet_backup = saagie.projects.get_info(project_id=backup_project_id)['project']
    print(f"pf =  {pf}")