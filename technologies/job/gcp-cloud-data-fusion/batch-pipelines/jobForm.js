const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudresourcemanager = google.cloudresourcemanager('v1');
const datafusion = google.datafusion('v1beta1');
const axios = require('axios');
const { getAuth, getErrorMessage, getHeadersWithAccessToken } = require('../utils');

/**
 * Function to retrieve projects for the authenticated user.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getProjects = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const auth = getAuth(gcpKey);

    const { data: { projects } } = await cloudresourcemanager.projects.list({
      auth,
    });

    if (!projects || !projects.length) {
      return Response.empty('No projects availables')
    }

    return Response.success(
      projects.map(({ projectId, name }) => ({
        id: projectId,
        label: name,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve projects");
  }
};

/**
 * Function to retrieve regions options for a defined project.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getRegions = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const auth = getAuth(gcpKey);

    const { data: { locations } } = await datafusion.projects.locations.list({
      auth,
      name : `projects/${featuresValues.project.id}`,
    });

    if (!locations || !locations.length) {
      return Response.empty('No regions availables')
    }

    return Response.success(
      locations.map(({locationId}) => ({
        id: locationId,
        label: locationId,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve regions");
  }
};

/**
 * Function to retrieve instances linked to the selected project and region.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getInstances = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const auth = getAuth(gcpKey);

    const { data: { instances } } = await datafusion.projects.locations.instances.list({
      auth,
      parent : `projects/${featuresValues.project.id}/locations/${featuresValues.region.id}`,
    });

    if (!instances || !instances.length) {
      return Response.empty('No instances availables')
    }

    return Response.success(
      instances.map(({ displayName, name, apiEndpoint }) => ({
        id: name,
        label: displayName,
        apiEndpoint,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve instances");
  }
};

/**
 * Function to retrieve batch pipelines linked to the selected instance.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getBatchPipelines = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const { data } = await axios.get(
      `${featuresValues.instance.apiEndpoint}/v3/namespaces/default/apps?artifactName=cdap-data-pipeline`,
      await getHeadersWithAccessToken(gcpKey),
    );

    if (!data || !data.length) {
      return Response.empty('No batch pipelines availables')
    }

    return Response.success(
      data.map(({ name }) => ({
        id: name,
        label: name,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve batch pipelines");
  }
};
