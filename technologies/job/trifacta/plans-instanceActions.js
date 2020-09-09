const axios = require('axios');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const { JOB_STATES } = require('./job-states');
const { getRequestConfigFromEndpointForm, extractLogs } = require('./utils');
const { ERRORS_MESSAGES, VALIDATION_FIELD } = require('./errors');

/**
 * Logic to start a job on Trifacta
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START JOB :', instance);

    const { data: { planSnapshotRunId } } = await axios.post(
      `${job.featuresValues.endpoint.url}/v4/plans/${job.featuresValues.plan.id}/run`,
      {},
      getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ planSnapshotRunId, planId: job.featuresValues.plan.id });
  } catch (error) {
    if (error && error.response) {
      if (
        error.response.status === 400
        && error.response.data
        && error.response.data.exception
        && error.response.data.exception.name === VALIDATION_FIELD
      ) {
        return Response.error(ERRORS_MESSAGES.MISSING_RUN_ENV_ERROR, { error: new Error(`${ERRORS_MESSAGES.MISSING_RUN_ENV_FULL_ERROR} : ${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`) });
      }

      if (error.response.data && error.response.data.exception) {
        return Response.error(`${ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR} : ${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`, { error: new Error(`${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`) });
      }

      return Response.error(`${ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR, { error });
  }
};

/**
 * Logic to retrieve Trifacta job status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET STATUS JOB:', instance);

    const { data: { status } } = await axios.get(
      `${job.featuresValues.endpoint.url}/v4/planSnapshotRuns/${instance.payload.planSnapshotRunId}`,
      getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
    );

    return Response.success(JOB_STATES[status] || JobStatus.AWAITING);

  } catch (error) {
    if (error && error.response) {
      return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR} : ${job.featuresValues.dataset.id}`, { error });
  }
};

/**
 * Logic to retrieve the Trifacta job logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET JOB LOGS:', instance);

    let logsLines = [];
    let logsPromises = [];

    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/v4/plans/${instance.payload.planId}/full?ensureOriginal=false`,
      getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
    );

    const { planSnapshots: { data: planSnapshotsData } } = data; 

    if (planSnapshotsData && planSnapshotsData.length > 0) {
      const lastPlanSnapshot = planSnapshotsData[0];

      const { data: planSnapshotData } = await axios.get(
        `${job.featuresValues.endpoint.url}/v4/plans/${lastPlanSnapshot.id}/full?ensureOriginal=false`,
        getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
      );

      const { planNodes: { data: planNodesData } } = planSnapshotData;

      planNodesData.forEach((planNode) => {
        const { planTaskSnapshotRuns } = planNode;

        const { data: planTaskSnapshotRunsData } = planTaskSnapshotRuns;

        const planTaskSnapshotRunCorrespondingToRun = planTaskSnapshotRunsData.find(
          (planTaskSnapshotRun) => planTaskSnapshotRun.planSnapshotRun.id === instance.payload.planSnapshotRunId
        );

        const { planFlowTaskRunResults: { data: planFlowTaskRunResultsData } } = planTaskSnapshotRunCorrespondingToRun;

        logsPromises = logsPromises.concat(planFlowTaskRunResultsData.map(async (flowTaskRun) => {

          const { jobGroup } = flowTaskRun;

          const { data: logsData } = await axios.get(
            `${job.featuresValues.endpoint.url}/v4/jobGroups/${jobGroup.id}/logs`,
            {
              ...getRequestConfigFromEndpointForm(job.featuresValues.endpoint),
              responseType: 'arraybuffer'
            }
          );

          logsLines = logsLines.concat(await extractLogs(logsData, jobGroup.id));
        }));

      });

      await Promise.all(logsPromises);
    }

    return Response.success(logsLines.map((line) => {
      const logDate = line.substring(0, 23);
      const logContent = line.substring(24);
      return Log(logContent, Stream.STDOUT, logDate);
    }));

  } catch (error) {
    if (error && error.response) {
      return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR} : ${job.featuresValues.plan.id}`, { error });
  }
};
