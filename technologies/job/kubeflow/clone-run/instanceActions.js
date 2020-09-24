const { Response } = require('@saagie/sdk');
const axios = require('axios');
const { getErrorMessage, getHeadersWithAccessToken } = require('../utils');
const { getLogs, getStatus, stop } = require('../instanceActions');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const { run } = job.featuresValues;

    const pipelineSpec = {
      pipeline_id: job.featuresValues.pipeline.id,
    };

    if (run.data.pipeline_spec.parameters) {
      pipelineSpec.parameters = run.data.pipeline_spec.parameters;
    }

    const { data } = await axios.post(
      `${job.featuresValues.endpoint.instanceUrl}:${job.featuresValues.endpoint.instancePort || 80}/pipeline/apis/v1beta1/runs`,
      {
        name: job.featuresValues.runName,
        description: job.featuresValues.runDescription || run.data.description,
        pipeline_spec: pipelineSpec,
      },
      await getHeadersWithAccessToken(job.featuresValues),
    );

    return Response.success(data);
  } catch (error) {
    return getErrorMessage(error, "Failed to start job");
  }
};

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = getLogs;
