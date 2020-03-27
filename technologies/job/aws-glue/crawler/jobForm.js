const axios = require('axios');
const { Response } = require('@saagie/sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasets = async ({ featuresValues }) => {
  try {
    const { data: datasets } = await axios.get(
      `${featuresValues.endpoint.url}/api/demo/datasets`,
    );

    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables');
    }

    return Response.success(
      datasets.map(({ name, id }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve datasets", { error });
  }
};
