const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { getAuthHeaders } = require('../utils');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getProjects = async ({ featuresValues }) => {
  try {
    const { data: projects } = await axios.get(
      `${featuresValues.endpoint.url}/public/api/projects/`,
      getAuthHeaders(featuresValues)
    );

    if (!projects || !projects.length) {
      return Response.empty('No projects availables');
    }

    return Response.success(
      projects.map(({ name, projectKey }) => ({
        id: projectKey,
        label: name,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve projects", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasets = async ({ featuresValues }) => {
  try {
    const { data: datasets } = await axios.get(
      `${featuresValues.endpoint.url}/public/api/projects/${featuresValues.project.id}/datasets/`,
      getAuthHeaders(featuresValues)
    );

    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables');
    }

    return Response.success(
      datasets.map(({ name }) => ({
        id: name,
        label: name,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve datasets", { error });
  }
};
