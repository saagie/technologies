const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { getRequestConfigFromEndpointForm } = require('./utils');
const { ERRORS_MESSAGES, SSL_ISSUES_CODE } = require('./errors');

/**
 * Function to get user flows in Trifacta
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFlows = async ({ featuresValues }) => {
  try {
    const result = await axios.get(
      `${featuresValues.endpoint.url}/v4/flows`,
      getRequestConfigFromEndpointForm(featuresValues.endpoint)
    );

    if (!result) {
      return Response.empty(ERRORS_MESSAGES.NO_RESPONSE_FROM_TRIFACTA);
    }

    const { data: dataResult } = result;

    if (!dataResult) {
      return Response.empty(ERRORS_MESSAGES.NO_RESPONSE_FROM_TRIFACTA);
    }

    const { data: flows } = dataResult;

    if (!flows || !flows.length) {
      return Response.empty(ERRORS_MESSAGES.NO_FLOWS);
    }

    return Response.success(
      flows.map(({ name, id }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    if (error && error.code === SSL_ISSUES_CODE) {
      return Response.error(ERRORS_MESSAGES.SSL_ERROR, { error: new Error(error.code) });
    }

    if (error && error.response) {
      if (error.response.status === 401) {
        return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      if (error.response.status === 404) {
        return Response.error(ERRORS_MESSAGES.RESOURCE_NOT_FOUND_ERROR, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      return Response.error(`${ERRORS_MESSAGES.FLOWS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.FLOWS_ERROR, { error });
  }
};

/**
 * Function to get datasets in selected flow
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasets = async ({ featuresValues }) => {
  try {
    const { data: result } = await axios.get(
      `${featuresValues.endpoint.url}/v4/wrangledDatasets`,
      getRequestConfigFromEndpointForm(featuresValues.endpoint)
    );

    if (!result) {
      return Response.empty(ERRORS_MESSAGES.NO_RESPONSE_FROM_TRIFACTA);
    }

    const { data: datasets } = result;

    if (!datasets || !datasets.length) {
      return Response.empty(ERRORS_MESSAGES.NO_DATASETS);
    }

    const datasetsInSelectedFlow = datasets.filter((dataset) => dataset.flow.id === featuresValues.flow.id);

    if (!datasets || !datasets.length) {
      return Response.empty(ERRORS_MESSAGES.NO_DATASETS_FOR_SELECTED_FLOW);
    }

    return Response.success(
      datasetsInSelectedFlow.map(({ name, id }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    if (error && error.response) {
      return Response.error(`${ERRORS_MESSAGES.DATASETS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.DATASETS_ERROR, { error });
  }
};
