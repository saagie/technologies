import os
import logging
import boto3
from pathlib import Path
from saagieapi import SaagieApi
import progressbar


def list_source_object(source_folder):
    """
    List all the files in a folder
    :param source_folder: str, path to the folder
    :return: list of str, list of the path to the files
    """
    path = Path(source_folder)
    paths = []
    for file_path in path.rglob("*"):
        if file_path.is_dir():
            continue
        str_file_path = str(file_path)
        paths.append(str_file_path)
    return paths


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


def main():

    # Get env vars
    storage_folder = os.environ["SAAGIE_APP_RESTORE_STORAGE_FOLDER"]  # Path directory on image, e.g. /notebooks-dir
    s3_bucket_name = os.environ["SAAGIE_APP_BACKUP_S3_BUCKET_NAME"]  # Bucket name on S3, e.g. saagie-backup
    s3_prefix = os.environ["SAAGIE_APP_RESTORE_S3_PREFIX"]  # Prefix of the file, e.g. id-projet/id-app/date
    project_id = os.environ["SAAGIE_APP_BACKUP_CURRENT_APP_PROJECT_ID"]  # Project ID of this app
    app_name = os.environ["SAAGIE_APP_RESTORE_TMP_APP_NAME"]  # Prefix of this app name

    logging.info("Start restore")

    # Connect to S3
    s3_client = boto3.client("s3",
                             endpoint_url=os.environ["SAAGIE_APP_BACKUP_S3_ENDPOINT"],
                             region_name=os.environ["SAAGIE_APP_BACKUP_S3_REGION_NAME"],
                             aws_access_key_id=os.environ["SAAGIE_APP_BACKUP_S3_ACCESS_KEY_ID"],
                             aws_secret_access_key=os.environ["SAAGIE_APP_BACKUP_S3_SECRET_ACCESS_KEY"])

    # Check if the bucket exist, if not create it
    bucket_exist = [True for bucket in s3_client.list_buckets()["Buckets"] if bucket["Name"] == s3_bucket_name]
    if not bucket_exist:
        raise Exception(f"The bucket [{s3_bucket_name}] does not exist")
    logging.info(f"{s3_prefix}/{storage_folder}")
    list_objects = list_objects_with_prefix(s3_client, s3_bucket_name, prefix=str(Path(f"{s3_prefix}")))
    logging.info(list_objects)

    # Download all the files to S3
    for file_path in list_objects:
        logging.info(f"Downloading the file [{file_path}]...")

        local_file_path = Path(storage_folder + "/" + file_path.split(storage_folder + "/")[-1])
        logging.info(f"===>local_file_path: {local_file_path}")
        logging.info(f"===>s3_bucket_name: {s3_bucket_name}")
        logging.info(f"===>file_path: {file_path}")
        local_file_path.parent.mkdir(parents=True, exist_ok=True)
        s3_client.download_file(s3_bucket_name,file_path,str(local_file_path))
        
        #write_file_to_s3(s3_client, s3_bucket_name, key_path, file_path)
        logging.info(f"Successful download on local: {local_file_path}")        

    logging.info(f"All files have been downloading")

    # Get information to connect to Saagie
    logging.info(f"Connect to Saagie ")
    url = os.getenv('SAAGIE_APP_BACKUP_SAAGIE_URL', 'https://saagie-tech.saagie.io')
    logging.info(f"---- url : {url}")
    platform_login = os.getenv('SAAGIE_APP_BACKUP_SAAGIE_USER', 'tech_user')
    platform_pwd = os.getenv('SAAGIE_APP_BACKUP_SAAGIE_PWD', 'tech_user')
    logging.info(f"---- platformLogin : {platform_login}")

    realm = get_realm_from_url(url)
    pf = os.getenv('SAAGIE_APP_BACKUP_PF_ID', '1')
    logging.info(f"{realm=}")
    logging.info(f"{pf=}")

    # Instantiate the Saagie API client
    client_saagie = SaagieApi(url_saagie=url,
                              id_platform=pf,
                              user=platform_login,
                              password=platform_pwd,
                              realm=realm)

    # Get current app ID
    project_apps = client_saagie.apps.list_for_project_minimal(project_id)["project"]["apps"]
    app_id = [app["id"] for app in project_apps if app["name"].startswith(app_name)][0]
    logging.info(f"Get the current app ID: {app_id}")

    # Stop the app
    client_saagie.apps.stop(app_id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s",
                        datefmt="%Y-%m-%d %H:%M:%S")
    main()
