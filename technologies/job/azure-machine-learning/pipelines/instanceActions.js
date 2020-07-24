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
 * Logic to re run the selected pipeline run.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('RE RUN PIPELINE RUN:', instance);

    const apiUrl = await getRegionalApiServer(job.featuresValues.workspace);

    const { data } = await axios.post(
      `${apiUrl}/studioservice/api/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/workspaces/${job.featuresValues.workspace.label}/pipelineruns/${job.featuresValues.pipelineRun.id}/rerun`,
      {
        experimentName: job.featuresValues.targetExperiment.label,
        description: job.featuresValues.description,
        pipelineParameters: {},
        dataPathAssignments: {},
        dataSetDefinitionValueAssignments: {}
      },
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    return Response.success({ newRunId: data, newRunExperimentId: job.featuresValues.targetExperiment.id });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_RUN_PIPELINE_RUN_ERROR);
  }
};

/**
 * Logic to stop the current pipeline run.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    console.log('STOP PIPELINE RUN:', instance);

    const apiUrl = await getRegionalApiServer(job.featuresValues.workspace);

    await axios.post(
      `${apiUrl}/pipelines/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/pipelineruns/${job.featuresValues.pipelineRun.id}/cancel`,
      {},
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_STOP_PIPELINE_RUN_ERROR);
  }
};

/**
 * Logic to retrieve the pipeline run status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET PIPELINE RUN STATUS:', instance);

    let pipelineRunId = job.featuresValues.pipelineRun.id;
    let experimentId = job.featuresValues.pipelineRun.experimentId;

    if (
      instance
      && instance.payload
      && instance.payload.newRunExperimentId
      && instance.payload.newRunId
    ) {
      pipelineRunId = instance.payload.newRunId;
      experimentId = instance.payload.newRunExperimentId;
    }

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/history/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experimentids/${experimentId}/runs/${pipelineRunId}/details`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    if (data && data.status) {
      return Response.success(JOB_STATES[data.status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR);
  }
};

/**
 * Logic to retrieve the pipeline run logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET PIPELINE RUN LOGS:', instance);

    let pipelineRunId = job.featuresValues.pipelineRun.id;
    let experimentId = job.featuresValues.pipelineRun.experimentId;

    if (
      instance
      && instance.payload
      && instance.payload.newRunExperimentId
      && instance.payload.newRunId
    ) {
      pipelineRunId = instance.payload.newRunId;
      experimentId = instance.payload.newRunExperimentId;
    }

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/history/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experimentids/${experimentId}/runs/${pipelineRunId}/details`,
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
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR);
  }
};
