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
    await axios.post(
      `http://${job.featuresValues.endpoint.instanceUrl}:${job.featuresValues.endpoint.instancePort || 80}/pipeline/apis/v1beta1/runs/${job.featuresValues.run.id}/retry`,
      {},
      await getHeadersWithAccessToken(job.featuresValues),
    );

    return Response.success({ run: job.featuresValues.run });
  } catch (error) {
    return getErrorMessage(error, "Failed to start job");
  }
};

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = getLogs;
