const axios = require('axios');
const { Response } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
  getHeadersWithAccessTokenForDatabricksResource,
  checkDataFromAzureResponse,
  getErrorMessage,
  AZURE_MANAGEMENT_API_URL,
} = require('../utils');
const { ERRORS_MESSAGES } = require('../errors');

/**
 * Function to retrieve resource groups linked to Azure credentials
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getResourceGroups = async ({ featuresValues }) => {
  try {
    const { subscriptionId } = featuresValues.endpoint;

    const res = await axios.get(
      `${AZURE_MANAGEMENT_API_URL}/subscriptions/${subscriptionId}/resourcegroups?api-version=2019-10-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint),
    );

    if (checkDataFromAzureResponse(res)) {
      return Response.success(res.data.value.map(({ id, name }) => ({
        id,
        label: name
      })));
    }

    return Response.empty(ERRORS_MESSAGES.NO_RESOURCE_GROUPS);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.RESOURCE_GROUPS_ERROR);
  }
};

/**
 * Function to retrieve Databricks workspaces linked to selected resource group
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkspaces = async ({ featuresValues }) => {
  try {
    const res = await axios.get(
      `${AZURE_MANAGEMENT_API_URL}${featuresValues.resourceGroup.id}/providers/Microsoft.Databricks/workspaces?api-version=2018-04-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(res)) {
      const workspaces = res.data.value;

      if (workspaces.length > 0) {
        return Response.success(workspaces.map(({ id, name, properties }) => ({
          id,
          url: properties.workspaceUrl,
          label: name
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_WORKSPACES);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.WORKSPACES_ERROR);
  }
};

const getAllNotebooksRecursively = async (path, featuresValues) => {
  const { data: { objects }} = await axios.get(
    `https://${featuresValues.workspace.url}/api/2.0/workspace/list`,
    {
      ...await getHeadersWithAccessTokenForDatabricksResource(featuresValues),
      params: {
        path,
      }
    }
  );

  if (objects) {
    const notebooks = objects.filter((obj) => obj.object_type === 'NOTEBOOK');
    const directories = objects.filter((obj) => obj.object_type === 'DIRECTORY');
  
    const notebooksFromDirectories = await Promise.all(
      directories.map(async (dir) => await getAllNotebooksRecursively(dir.path, featuresValues))
    );
  
    return [
      ...notebooks,
      ...notebooksFromDirectories.flat()
    ];
  }

  return [];
}

/**
 * Function to retrieve notebooks inside selected Databricks workspace
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getNotebooks = async ({ featuresValues }) => {
  try {
    const notebooks = await getAllNotebooksRecursively('/', featuresValues);

    if (notebooks && notebooks.length > 0) {
      return Response.success(notebooks.map(({ object_id, path }) => ({
        id: object_id,
        label: path
      })));
    }

    return Response.empty(ERRORS_MESSAGES.NO_NOTEBOOKS);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.JOBS_ERROR);
  }
};
