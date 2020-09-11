const axios = require('axios');
const { Response, JobStatus } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
  getErrorMessage,
  AZURE_MANAGEMENT_API_URL,
} = require('../utils');
const { ERRORS_MESSAGES } = require('../errors');
const { JOB_STATES } = require('../job-states');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    const res = await axios.post(
      `${AZURE_MANAGEMENT_API_URL}${job.featuresValues.resourceGroup.id}/providers/Microsoft.DataFactory/factories/${job.featuresValues.factory.label}/pipelines/${job.featuresValues.pipeline.label}/createRun?api-version=2018-06-01`,
      {},
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    if (res && res.data && res.data.runId) {
      return Response.success({
        runId: res.data.runId,
      });
    }

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR);
  }
};

/**
 * Logic to stop the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    console.log('STOP INSTANCE:', instance);

    await axios.post(
      `${AZURE_MANAGEMENT_API_URL}${job.featuresValues.resourceGroup.id}/providers/Microsoft.DataFactory/factories/${job.featuresValues.factory.label}/pipelineruns/${instance.payload.runId}/cancel?api-version=2018-06-01`,
      {},
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_STOP_JOB_ERROR);
  }
};

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET STATUS INSTANCE:', instance);
    const res = await axios.get(
      `${AZURE_MANAGEMENT_API_URL}${job.featuresValues.resourceGroup.id}/providers/Microsoft.DataFactory/factories/${job.featuresValues.factory.label}/pipelineruns/${instance.payload.runId}?api-version=2018-06-01`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    if (res && res.data && res.data.status) {
      return Response.success(JOB_STATES[res.data.status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR);
  }
};

exports.getLogs = () => {};
