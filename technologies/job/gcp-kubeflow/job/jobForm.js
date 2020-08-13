const { Response } = require('@saagie/sdk');
const axios = require('axios');
const { getHeadersWithAccessToken, getErrorMessage, getAuth } = require('./utils');
const { google } = require('googleapis');
const cloudresourcemanager = google.cloudresourcemanager('v1');

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
 * Function to retrieve pipelines inside the Kubeflow instance
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getPipelines = async ({ featuresValues }) => {
  try{
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

    const { data: { pipelines } } = await axios.get(
      `${featuresValues.endpoint.instanceUrl}/apis/v1beta1/pipelines`,
      await getHeadersWithAccessToken(gcpKey)
    );

    if (!pipelines || !pipelines.length) {
      return Response.empty('No pipelines availables')
    }
    
    return Response.success(
      pipelines.map(({ id, name }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve pipelines");
  }
};

/**
 * Function to retrieve pipeline versions for the selected pipeline
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getPipelineVersions = async ({ featuresValues }) => {
  try{
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

    const { data: { versions } } = await axios.get(
      `${featuresValues.endpoint.instanceUrl}/apis/v1beta1/pipeline_versions?resource_key.type=PIPELINE&resource_key.id=${featuresValues.pipeline.id}`,
      await getHeadersWithAccessToken(gcpKey),
    );

    if (!versions || !versions.length) {
      return Response.empty('No versions availables')
    }
    
    return Response.success(
      versions.map(({ id, name }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve versions");
  }
};

/**
 * Function to retrieve experiments inside the Kubeflow instance
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getExperiments = async ({ featuresValues }) => {
  try{
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

    const { data: { experiments } } = await axios.get(
      `${featuresValues.endpoint.instanceUrl}/apis/v1beta1/experiments`,
      await getHeadersWithAccessToken(gcpKey)
    );

    if (!experiments || !experiments.length) {
      return Response.empty('No experiments availables')
    }
    
    return Response.success(
      experiments.map(({ id, name }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve experiments");
  }
};
