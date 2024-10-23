# Saagie backup-restore apps

## Description

**Saagie backup_restore_apps** allows you to create and restore backups of storages linked to your Saagie applications, on your own S3 storage.
It's composed by a main UI application which launch sub-apps to backup or restore your storages.

## How to launch it

To deploy the app: you need to create the app with port `8050` exposed, `Base path variable:SAAGIE_BASE_PATH`, don't select `Use rewrite url` and set the port access as `PROJECT`.

Many environment variables are mandatories (S3 properties included), you can find the list below this part.

Once the app is up, you can open the page of port 8050 and find two tabs :
- a tab to backup storages with a list of all your apps which your select by a checkbox to backup them
- a tab to restore storages with an app selection then a date of backup desired

### Environment Variables

NOTE: Set environment variables at the project level.

#### Mandatories
- `SAAGIE_APP_BACKUP_S3_ENDPOINT`: Endpoint of the S3 provider of storage object
- `SAAGIE_APP_BACKUP_S3_REGION_NAME`: Name of the S3 region of the storage object
- `SAAGIE_APP_BACKUP_S3_ACCESS_KEY_ID`: Access key of the storage object
- `SAAGIE_APP_BACKUP_S3_SECRET_ACCESS_KEY`: Secret access key of the storage object
- `SAAGIE_APP_BACKUP_S3_BUCKET_NAME`: Name of the bucket of the storage object where to back up the apps
- `SAAGIE_APP_BACKUP_SAAGIE_URL`: URL of the Saagie environment
- `SAAGIE_APP_BACKUP_PF_ID`: ID of the current Saagie platform
- `SAAGIE_APP_BACKUP_SAAGIE_USER`: Login of a Saagie user. Required to use the Saagie API for access to your apps. This user needs necessary roles on all projects which you want allow backup & restore.
- `SAAGIE_APP_BACKUP_SAAGIE_PWD`: Password of the Saagie user
- `SAAGIE_APP_BACKUP_CURRENT_APP_PROJECT_ID`: Project ID of the backup-restore application

#### Optionals
- `SAAGIE_APP_BACKUP_LIST_APP_ID`: List of application IDs to backup
- `SAAGIE_APP_RESTORE_LIST_APP_ID`: List of application IDs to restore
- `SAAGIE_APP_BACKUP_SUB_APP_PREFIX`: Temporary backup app name prefix
- `SAAGIE_APP_RESTORE_SUB_APP_PREFIX`: Temporary restore app name prefix
- `SAAGIE_APP_BACKUP_TIMEOUT_RESTORE`: Timeout (in seconds) for restore a storage from S3 (default: 600)
- `SAAGIE_APP_BACKUP_TIMEOUT_BACKUP`: Timeout (in seconds) for backup a storage from S3 (default: 600)


**Useless to config**
- `SAAGIE_APP_BACKUP_S3_PREFIX`: Prefix of the storage object bucket where to backup apps
- `SAAGIE_APP_RESTORE_S3_PREFIX`: Prefix of the storage object bucket where to recover apps
- `SAAGIE_APP_BACKUP_STORAGE_FOLDER`: Storage folder, Path directory on app image
- `SAAGIE_APP_RESTORE_STORAGE_FOLDER`: Storage folder, Path directory on app image
- `SAAGIE_BASE_PATH`: BasePath of Saagie

