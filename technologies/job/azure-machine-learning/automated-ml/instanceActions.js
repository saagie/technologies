const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
  getExperimentsApiServer,
  getRegionalApiServer,
  getErrorMessage,
} = require('../utils');
const { JOB_STATES } = require('../job-states');
const { ERRORS_MESSAGES } = require('../errors');

/**
 * Logic to start a new Automated ML run
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START AUTOMATED ML RUN:', instance);

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const runProperties = JSON.parse(job.featuresValues.runProperties);

    const { data } = await axios.post(
      `${apiUrl}/jasmine/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experiment/${job.featuresValues.experiment.label}/run`,
      runProperties,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    return Response.success({ runId: data });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_RUN_AUTOMATED_ML_RUN_ERROR);
  }
};

/**
 * Logic to stop the Automated ML run
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    console.log('STOP AUTOMATED ML RUN:', instance);

    const apiUrl = await getRegionalApiServer(job.featuresValues.workspace);

    await axios.post(
      `${apiUrl}/jasmine/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experiment/${job.featuresValues.experiment.label}/cancel/${instance.payload.runId}`,
      {},
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_STOP_AUTOMATED_ML_RUN_ERROR);
  }
};

/**
 * Logic to retrieve the Automated ML run status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET PIPELINE RUN STATUS:', instance);

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/history/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experimentids/${job.featuresValues.experiment.id}/runs/${instance.payload.runId}/details`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    if (data && data.status) {
      return Response.success(JOB_STATES[data.status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_AUTOMATED_ML_RUN_STATUS_ERROR);
  }
};

/**
 * Logic to retrieve the Automated ML run logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET PIPELINE RUN LOGS:', instance);

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/history/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experimentids/${job.featuresValues.experiment.id}/runs/${instance.payload.runId}/details`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    const { logFiles } = data;

    const logFilesUrls = Object.values(logFiles);

    if (logFilesUrls && logFilesUrls.length > 0) {
      let logsContent = '';

      await Promise.all(
        logFilesUrls.map(async (logFileUrl) => {
          const logFileContent = await axios.get(logFileUrl);

          if (logFileContent && logFileContent.data) {
            logsContent = logsContent.concat(logFileContent.data);
          }
        })
      );

      const logsLines = logsContent.split('\n');

      return Response.success(logsLines.map((logLine) => Log(logLine)));
    }

    return Response.success([]);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_AUTOMATED_ML_RUN_LOGS_ERROR);
  }
};
