const axios = require('axios');
const { Response } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
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
 * Function to retrieve Data Factories linked to selected resource group
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFactories = async ({ featuresValues }) => {
  try {
    const res = await axios.get(
      `${AZURE_MANAGEMENT_API_URL}${featuresValues.resourceGroup.id}/providers/Microsoft.DataFactory/factories?api-version=2018-06-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(res)) {
      const factories = res.data.value;

      if (factories.length > 0) {
        return Response.success(factories.map(({ id, name }) => ({
          id,
          label: name
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_FACTORIES);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FACTORIES_ERROR);
  }
};

/**
 * Function to retrieve Pipelines inside the selected Data Factory
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getPipelines = async ({ featuresValues }) => {
  try {
    const res = await axios.get(
      `${AZURE_MANAGEMENT_API_URL}${featuresValues.resourceGroup.id}/providers/Microsoft.DataFactory/factories/${featuresValues.factory.label}/pipelines?api-version=2018-06-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(res)) {
      const pipelines = res.data.value;

      if (pipelines.length > 0) {
        return Response.success(pipelines.map(({ id, name }) => ({
          id,
          label: name
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_PIPELINES);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.PIPELINES_ERROR);
  }
};

