const axios = require('axios');
const FormData = require('form-data');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
  getExperimentsApiServer,
  getRegionalApiServer,
  dataBase64toFile,
} = require('../utils');
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

    const apiUrl = await getRegionalApiServer(job.featuresValues.workspace);

    const projectZipFileObj = Buffer.from(job.featuresValues.projectZipFile, "base64");

    const runDefinitionFileObj = Buffer.from(job.featuresValues.runDefinitionFile, "base64");

    const formData = new FormData();
    formData.append('projectZipFile', projectZipFileObj, 'train.zip');
    formData.append('runDefinitionFile', runDefinitionFileObj, 'runDefinition.json');

    const headersWithAccessToken = await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint);

    const { data } = await axios.post(
      `${apiUrl}/execution/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experiments/${job.featuresValues.experiment.label}/startrun?api-version=2019-11-01`,
      formData,
      {
        headers: {
          ...headersWithAccessToken.headers,
          ...formData.getHeaders(),
        }
      }
    );

    return Response.success({ runId: data.runId });
  } catch (error) {
    return Response.error('Fail to start job', { error });
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

    const apiUrl = await getRegionalApiServer(job.featuresValues.workspace);

    await axios.post(
      `${apiUrl}/execution/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experiments/${job.featuresValues.experiment.label}/runId/${instance.payload.runId}/cancel`,
      {},
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    return Response.success();
  } catch (error) {
    return Response.error('Fail to stop job', { error });
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
    return Response.error('Failed to get status for dataset', { error });
  }
};

/**
 * Logic to retrieve the external job instance logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET LOG INSTANCE:', instance);

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
    return Response.error('Failed to get log for dataset', { error });
  }
};
