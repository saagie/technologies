const { Response } = require('@saagie/sdk');
const axios = require('axios');
const { getHeadersWithAccessToken, getErrorMessage, EXPERIMENT_LABEL, PIPELINE_VERSION_LABEL } = require('../utils');

/**
 * Function to retrieve pipelines inside the Kubeflow instance
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getPipelines = async ({ featuresValues }) => {
  try{
    const { data: { pipelines } } = await axios.get(
      `${featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/pipelines`,
      await getHeadersWithAccessToken(featuresValues)
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
    const { data: { versions } } = await axios.get(
      `${featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/pipeline_versions?resource_key.type=PIPELINE&resource_key.id=${featuresValues.pipeline.id}`,
      await getHeadersWithAccessToken(featuresValues),
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
    const { data: { experiments } } = await axios.get(
      `${featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/experiments`,
      await getHeadersWithAccessToken(featuresValues)
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

/**
 * Function to retrieve runs inside the Kubeflow instance
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getRuns = async ({ featuresValues }) => {
  try{
    const { data: { runs } } = await axios.get(
      `${featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/runs`,
      await getHeadersWithAccessToken(featuresValues)
    );

    const filteredRuns = runs.filter((run) => {
      const { resource_references: resourceReferences } = run;

      const runExperiment = resourceReferences.find((resource) => resource.key && resource.key.type === EXPERIMENT_LABEL);

      const runPipelineVersion = resourceReferences.find((resource) => resource.key && resource.key.type === PIPELINE_VERSION_LABEL);

      return (
        (runExperiment && runExperiment.key && runExperiment.key.id === featuresValues.experiment.id)
        && (runPipelineVersion && runPipelineVersion.key && runPipelineVersion.key.id === featuresValues.pipelineVersion.id)
      );
    });

    if (!filteredRuns || !filteredRuns.length) {
      return Response.empty('No runs availables')
    }

    return Response.success(
      filteredRuns.map(({ id, name, ...runData }) => ({
        id,
        label: name,
        data: runData,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve runs");
  }
};

