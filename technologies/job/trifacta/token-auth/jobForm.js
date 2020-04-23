const axios = require('axios');
const https = require('https');
const { Response } = require('@saagie/sdk');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

const SSL_ISSUES_CODE = 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';

/**
 * Function to get user flows in Trifacta
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFlows = async ({ featuresValues }) => {
  try {
    const result = await axios.get(
      `${featuresValues.endpoint.url}/v4/flows`,
      {
        httpsAgent: featuresValues.endpoint.ignoreSslIssues && featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
        headers: {
          'Authorization': `Bearer ${featuresValues.endpoint.access_token}`
        }
      }
    );

    if (!result) {
      return Response.empty('No response from Trifacta');
    }

    const { data: dataResult } = result;

    if (!dataResult) {
      return Response.empty('No response from Trifacta');
    }

    const { data: flows } = dataResult;

    if (!flows || !flows.length) {
      return Response.empty('No datasets availables');
    }

    return Response.success(
      flows.map(({ name, id }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    if (error && error.code === SSL_ISSUES_CODE) {
      return Response.error('Can\'t retrieve flows from Trifacta : SSL error, you can disable SSL issues in Endpoint form', { error: new Error(error.code) });
    }

    if (error && error.response) {
      if (error.response.status === 401) {
        return Response.error('Can\'t retrieve flows from Trifacta : Login error, please check your credentials in Endpoint form', { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      if (error.response.status === 404) {
        return Response.error('Can\'t retrieve flows from Trifacta : Resource not found, please check your endpoint URL in Endpoint form', { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      if (
        error.response.status === 400
        && error.response.data
        && error.response.data.exception
        && error.response.data.exception.name === 'InvalidAccessTokenException'
      ) {
        return Response.error(`Can\'t retrieve flows from Trifacta : ${error.response.data.exception.message} - ${error.response.data.exception.details}`, { error: new Error(`${error.response.data.exception.message} - ${error.response.data.exception.details}`) });
      }

      return Response.error(`Can't retrieve flows from Trifacta : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error('Can\'t retrieve flows from Trifacta', { error });
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
      {
        httpsAgent: featuresValues.endpoint.ignoreSslIssues && featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
        headers: {
          'Authorization': `Bearer ${featuresValues.endpoint.access_token}`
        }
      }
    );

    if (!result) {
      return Response.empty('No response from Trifacta');
    }

    const { data: datasets } = result;

    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables');
    }

    const datasetsInSelectedFlow = datasets.filter((dataset) => dataset.flow.id === featuresValues.flow.id);

    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables for this flow');
    }

    return Response.success(
      datasetsInSelectedFlow.map(({ name, id }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    if (error && error.response) {
      return Response.error(`Can't retrieve wrangled datasets from Trifacta : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error('Error while parsing wrangled datasets data from Trifacta response', { error });
  }
};
