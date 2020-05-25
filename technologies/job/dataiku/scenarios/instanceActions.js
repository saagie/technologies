const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { getAuthHeaders } = require('../utils');
const { SCENARIO_STATES } = require('../scenario-states');
const { ERRORS_MESSAGES } = require('../errors');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    const { data } = await axios.post(
      `${job.featuresValues.endpoint.url}/public/api/projects/${job.featuresValues.project.id}/scenarios/${job.featuresValues.scenario.id}/run/`,
      {},
      getAuthHeaders(job.featuresValues)
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({
      jobId: data.id,
      triggerId: data.trigger && data.trigger.id,
      runId: data.runId,
    });
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FAILED_TO_RUN_SCENARIO_ERROR, { error });
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
      `${job.featuresValues.endpoint.url}/public/api/projects/${job.featuresValues.project.id}/scenarios/${job.featuresValues.scenario.id}/abort/`,
      {},
      getAuthHeaders(job.featuresValues)
    );
    return Response.success();
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FAILED_TO_STOP_SCENARIO_ERROR, { error });
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
    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/public/api/projects/${job.featuresValues.project.id}/scenarios/${job.featuresValues.scenario.id}/light/`,
      getAuthHeaders(job.featuresValues)
    );

    if (data && data.running) {
      return Response.success(JobStatus.RUNNING);
    }

    const { data: runTriggerData } = await axios.get(
      `${job.featuresValues.endpoint.url}/public/api/projects/${job.featuresValues.project.id}/scenarios/${job.featuresValues.scenario.id}/get-run-for-trigger/?triggerId=${instance.payload.triggerId}&triggerRunId=${instance.payload.runId}`,
      getAuthHeaders(job.featuresValues)
    );

    if (
      runTriggerData
      && runTriggerData.scenarioRun
      && runTriggerData.scenarioRun.result
      && runTriggerData.scenarioRun.result.outcome
    ) {
      return Response.success(SCENARIO_STATES[runTriggerData.scenarioRun.result.outcome] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_SCENARIO_STATUS_ERROR, { error });
  }
};
