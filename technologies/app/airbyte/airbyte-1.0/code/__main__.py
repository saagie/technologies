import logging
import requests
import os
from saagieapi import SaagieApi
from requests.auth import HTTPBasicAuth
from requests import ConnectionError as requestsConnectionError
from requests import HTTPError, RequestException, Timeout
import sys


def main():

    saagie_login = os.environ["SAAGIE_LOGIN"]
    saagie_password = os.environ["SAAGIE_PASSWORD"]
    saagie_url = os.environ["SAAGIE_URL"] + "/" if not os.environ["SAAGIE_URL"].endswith("/") else os.environ["SAAGIE_URL"]
    saagie_realm = os.environ["SAAGIE_REALM"]
    saagie_platform = os.environ["SAAGIE_PLATFORM_ID"]
    saagie_project_name = os.environ["SAAGIE_PROJECT_NAME"]

    airbyte_login = os.environ["AIRBYTE_LOGIN"]
    airbyte_pwd = os.environ["AIRBYTE_PASSWORD"]
    airbyte_url = os.environ["AIRBYTE_URL"]
    airbyte_workspace = "AIRBYTE_WORKSPACE_URL"

    if not airbyte_url.endswith("/"):
        airbyte_url += "/"
    if "AIRBYTE_WORKSPACE_NAME" not in os.environ:
        worspace_name = saagie_project_name
    else:
        worspace_name = os.environ["AIRBYTE_WORKSPACE_NAME"]

    var_file = "/tmp/airbyte_url_workspace.txt"

    json_to_create_workspace = {
        "name": worspace_name
    }

    saagie = SaagieApi(url_saagie=saagie_url,
                       id_platform=saagie_platform,
                       user=saagie_login,
                       password=saagie_password,
                       realm=saagie_realm)

    saagie_project_id = saagie.projects.get_id(project_name=saagie_project_name)

    existing_env_var = saagie.env_vars.list_for_project(saagie_project_id)["projectEnvironmentVariables"]
    present = airbyte_workspace in [env["name"] for env in existing_env_var if env["scope"] == "PROJECT"]

    if present:
        airbyte_url_workspace = [env["value"] for env in existing_env_var if env["scope"] == "PROJECT" and env["name"] == airbyte_workspace][0]
        with open(var_file, "a") as file:
            file.write(airbyte_url_workspace)
        logging.info(f"Environment variable Airbyte workspace already exists: [{airbyte_url_workspace}]")

    else:
        try:
            res = requests.post(f'{airbyte_url}api/v1/workspaces/create',
                                auth=HTTPBasicAuth(airbyte_login, airbyte_pwd),
                                json=json_to_create_workspace
                                )
            res.raise_for_status()
        except (HTTPError, requestsConnectionError, Timeout, RequestException) as err:
            logging.error(err)
            sys.exit(1)

        if res.status_code == 200:
            logging.info(f"Workspace [{worspace_name}] created")
            workspace_id = res.json()["workspaceId"]
            airbyte_url_workspace = f"{airbyte_url}workspaces/{workspace_id}/connections"
            with open(var_file, "a") as file:
                file.write(airbyte_url_workspace)

            saagie.env_vars.create_for_project(project_id=saagie_project_id,
                                               name=airbyte_workspace,
                                               value=airbyte_url_workspace,
                                               description="URL of Airbyte workspace")
            logging.info(f"Environment variable Airbyte workspace created: [{airbyte_url_workspace}]")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s [%(levelname)s] %(message)s",
                        datefmt="%d/%m/%Y %H:%M:%S")
    main()
