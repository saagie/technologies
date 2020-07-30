const axios = require('axios');
const { Response } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
  checkDataFromAzureResponse,
  getErrorMessage,
  getExperimentsApiServer,
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
 * Function to retrieve workspaces linked to selected resource group
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkspaces = async ({ featuresValues }) => {
  try {
    const res = await axios.get(
      `${AZURE_MANAGEMENT_API_URL}${featuresValues.resourceGroup.id}/providers/Microsoft.MachineLearningServices/workspaces?api-version=2019-05-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(res)) {
      const workspaces = res.data.value;

      if (workspaces.length > 0) {
        return Response.success(workspaces.map(({ id, name, properties }) => ({
          id,
          url: properties.workspaceUrl,
          label: name,
          properties
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_WORKSPACES);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.WORKSPACES_ERROR);
  }
};

/**
 * Function to retrieve experiments linked to selected workspace
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getExperiments = async ({ featuresValues }) => {
  try {
    const apiUrl = await getExperimentsApiServer(featuresValues.workspace);

    const res = await axios.get(
      `${apiUrl}/history/v1.0/subscriptions/${featuresValues.endpoint.subscriptionId}/resourceGroups/${featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${featuresValues.workspace.label}/experiments`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(res)) {
      const experiments = res.data.value;

      if (experiments.length > 0) {
        return Response.success(experiments.map(({ experimentId, name }) => ({
          id: experimentId,
          label: name
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_EXPERIMENTS);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.EXPERIMENTS_ERROR);
  }
};

/**
 * Function to retrieve datasets linked to selected workspace
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasets = async ({ featuresValues }) => {
  try {
    const apiUrl = await getExperimentsApiServer(featuresValues.workspace);

    const res = await axios.get(
      `${apiUrl}/dataset/v1.0/subscriptions/${featuresValues.endpoint.subscriptionId}/resourceGroups/${featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${featuresValues.workspace.label}/datasets`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(res)) {
      const datasets = res.data.value;

      if (datasets.length > 0) {
        return Response.success(datasets.map(({ datasetId, name, latest }) => ({
          id: datasetId,
          label: name,
          savedId: latest.savedDatasetId,
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_DATASETS);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.DATASETS_ERROR);
  }
};

/**
 * Function to retrieve columns linked to selected dataset
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasetColumns = async ({ featuresValues }) => {
  try {
    const apiUrl = await getExperimentsApiServer(featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/dataset/v1.0/subscriptions/${featuresValues.endpoint.subscriptionId}/resourceGroups/${featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${featuresValues.workspace.label}/saveddatasets/${featuresValues.dataset.savedId}/tieredpreview`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (data && data.quickPreviewResult) {
      const datasetPreview = JSON.parse(data.quickPreviewResult);

      if (datasetPreview && datasetPreview.schema) {
        return Response.success(datasetPreview.schema.map(({ id }) => ({
          id,
          label: id
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_DATASET_COLUMNS);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.DATASET_COLUMNS_ERROR);
  }
};

/**
 * Function to retrieve computes linked to workspace
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getComputes = async ({ featuresValues }) => {
  try {
    const res = await axios.get(
      `${AZURE_MANAGEMENT_API_URL}/subscriptions/${featuresValues.endpoint.subscriptionId}/resourceGroups/${featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${featuresValues.workspace.label}/computes?api-version=2020-04-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(res)) {
      const computes = res.data.value;

      const amlComputes = computes.filter((compute) => compute && compute.properties && compute.properties.computeType === 'AmlCompute');

      if (amlComputes.length > 0) {
        return Response.success(amlComputes.map(({ id, name, properties }) => ({
          id,
          label: name,
          properties,
        })));
      }
    }

    return Response.empty(ERRORS_MESSAGES.NO_COMPUTES);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.COMPUTES_ERROR);
  }
};

