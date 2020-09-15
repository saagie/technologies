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
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
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
 * Function to retrieve Databricks workspaces to selected resource group
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

/**
 * Function to retrieve jobs to selected Databricks workspace
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getJobs = async ({ featuresValues }) => {
  try {
    const res = await axios.get(
      `https://${featuresValues.workspace.url}/api/2.0/jobs/list`,
      await getHeadersWithAccessTokenForDatabricksResource(featuresValues),
    );

    if (res && res.data && res.data.jobs && res.data.jobs.length > 0) {
      return Response.success(res.data.jobs.map(({ job_id, settings }) => ({
        id: job_id,
        label: settings.name,
      })));
    }

    return Response.empty(ERRORS_MESSAGES.NO_JOBS);
  } catch (error) {
    console.log({ error });
    return getErrorMessage(error, ERRORS_MESSAGES.JOBS_ERROR);
  }
};
