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
    
    await axios.post(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs/${job.featuresValues.run.id}/retry`,
      {},
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success({ run: job.featuresValues.run });
  } catch (error) {
    return getErrorMessage(error, "Failed to start job");
  }
};

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = getLogs;
