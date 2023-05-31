# Airbyte

![Docker Image Size (tag)](https://img.shields.io/docker/image-size/saagie/airbyte/1.0)

## Description

This folder contains the image of the redirection to the VM containing the OSS version of Airbyte allowing the creation of data flows.

A project can create his own Airbyte connections without being seen by other projects while there is only one single user on the OSS version of Airbyte.
For more details about the limitation of OSS version of Airbyte, click [here](https://airbyte.com/airbyte-open-source)

## How to build in local

Inside the `airbyte` folder corresponding to your version, run :
```
docker build -t saagie/airbyte:<version> .
docker push saagie/airbyte:<version>
```

## How to launch it

To deploy Airbyte on your platform, first, you have to request a VM containing Airbyte to Saagie, 
[click here to create your request](https://saagie.zendesk.com/hc/en-us).
Then you need to create a user with editor rights on the project that you want to install 
airbyte, and then set the following environment variables in Saagie  :

- AIRBYTE_URL : URL of the VM containing Airbyte
- AIRBYTE_LOGIN : Login of the VM containing Airbyte
- AIRBYTE_PASSWORD : Password of the VM containing Airbyte
- SAAGIE_LOGIN: Login of Saagie platform user (please make sure that this user have editor rights on `SAAGIE_PROJECT_NAME`)
- SAAGIE_PASSWORD: Password of Saagie platform user
- SAAGIE_URL: URL of the Saagie platform (i.e. : `https://saagie-workspace.prod.saagie.io`)
- SAAGIE_PLATFORM_ID : ID of your plateform  (Default value : `1`)
- SAAGIE_PROJECT_NAME: Project name of Saagie
- AIRBYTE_WORKSPACE_NAME (optional): Workspace's name of Airbyte, if not set, it will be the same as `SAAGIE_PROJECT_NAME`