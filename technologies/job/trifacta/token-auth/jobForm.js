const axios = require('axios');
const https = require('https');
const { Response } = require('@saagie/sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFlows = async ({ featuresValues }) => {
  try {
    const agent = new https.Agent({  
      rejectUnauthorized: false
    });

    const { data: result } = await axios.get(
      `${featuresValues.endpoint.url}/v4/flows`,
      {
        httpsAgent: agent,
        headers: {
          'Authorization': `Bearer ${featuresValues.endpoint.access_token}`
        }
      }
    );

    if (!result) {
      return Response.empty('No response from Trifacta');
    }

    const { data: flows } = result;

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
    return Response.error("Can't retrieve flows", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasets = async ({ featuresValues }) => {
  console.log({ featuresValues });
  try {
    const agent = new https.Agent({  
      rejectUnauthorized: false
    });

    const { data: result } = await axios.get(
      `${featuresValues.endpoint.url}/v4/wrangledDatasets`,
      {
        httpsAgent: agent,
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
    return Response.error("Can't retrieve datasets", { error });
  }
};
