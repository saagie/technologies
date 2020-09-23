const { Response } = require('@saagie/sdk');
const axios = require('axios');
const { getErrorMessage, getHeadersWithAccessToken } = require('../utils');
const { stop, getStatus, getLogs } = require('../instanceActions');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { run } = job.featuresValues;

    const pipelineSpec = {
      pipeline_id: run.data.pipeline_spec.pipeline_id,
    };

    let runParameters = null;

    if (job.featuresValues.runParameters) {
      runParameters = JSON.parse(job.featuresValues.runParameters);
    }

    if (runParameters || run.data.pipeline_spec.parameters) {
      pipelineSpec.parameters = runParameters || run.data.pipeline_spec.parameters;
    }

    const { data } = await axios.post(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs`,
      {
        name: job.featuresValues.runName,
        description: job.featuresValues.runDescription || run.data.description,
        pipeline_spec: pipelineSpec,
      },
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success(data);
  } catch (error) {
    return getErrorMessage(error, "Failed to start job");
  }
};

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = getLogs;
