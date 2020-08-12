const { Response, JobStatus, Log } = require('@saagie/sdk');
const axios = require('axios');
const { getErrorMessage, getHeadersWithAccessToken } = require('../utils');
const { JOB_STATUS } = require('../job-states');

/**
 * Logic to start a GCP Cloud Data Fusion pipeline
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    await axios.post(
      `${job.featuresValues.instance.apiEndpoint}/v3/namespaces/default/apps/${job.featuresValues.pipeline.id}/workflows/DataPipelineWorkflow/start`,
      {},
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, 'Failed to run GCP Cloud Data Fusion pipeline');
  }
};

/**
 * Logic to stop a Cloud Data Fusion pipeline
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.stop = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    await axios.post(
      `${job.featuresValues.instance.apiEndpoint}/v3/namespaces/default/apps/${job.featuresValues.pipeline.id}/workflows/DataPipelineWorkflow/stop`,
      {},
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, 'Failed to stop GCP Cloud Data Fusion pipeline');
  }
};

/**
 * Logic to retrieve the Cloud Data Fusion pipeline status
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.getStatus = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { data: runs } = await axios.get(
      `${job.featuresValues.instance.apiEndpoint}/v3/namespaces/default/apps/${job.featuresValues.pipeline.id}/workflows/DataPipelineWorkflow/runs`,
      await getHeadersWithAccessToken(gcpKey),
    );

    if (runs && runs.length > 0 && runs[0]) {
      return Response.success(JOB_STATUS[runs[0].status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, 'Failed to get status for GCP Cloud Data Fusion pipeline status');
  }
};

/**
 * Logic to retrieve the Cloud Data Fusion pipeline logs
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.getLogs = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { data } = await axios.get(
      `${job.featuresValues.instance.apiEndpoint}/v3/namespaces/default/apps/${job.featuresValues.pipeline.id}/workflows/DataPipelineWorkflow/logs`,
      await getHeadersWithAccessToken(gcpKey),
    );

    const logs = data.split('\n');

    return Response.success(logs.map(log => Log(log)));
  } catch (error) {
    return getErrorMessage(error, 'Failed to get logs for GCP Cloud Data Fusion pipeline');
  }
};
