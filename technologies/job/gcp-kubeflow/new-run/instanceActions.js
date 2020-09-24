const { Response } = require('@saagie/sdk');
const axios = require('axios');
const { getErrorMessage, getHeadersWithAccessToken, EXPERIMENT_LABEL, PIPELINE_VERSION_LABEL } = require('../utils');
const { stop, getStatus, getLogs } = require('../instanceActions');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const pipelineSpec = {
      pipeline_id: job.featuresValues.pipeline.id,
    };

    if (job.featuresValues.runParameters) {
      const runParameters = JSON.parse(job.featuresValues.runParameters);
      pipelineSpec.parameters = runParameters;
    }
    
    const { data } = await axios.post(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs`,
      {
        name: job.featuresValues.runName,
        description: job.featuresValues.runDescription,
        pipeline_spec: pipelineSpec,
        resource_references: [
          {
            key: {
              id: job.featuresValues.experiment.id,
              type: EXPERIMENT_LABEL,
            },
            relationship: 'OWNER',
          },
          {
            key: {
              id: job.featuresValues.pipelineVersion.id,
              type: PIPELINE_VERSION_LABEL,
            },
            relationship: 'CREATOR',
          }
        ],
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