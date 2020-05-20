const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const { JOB_STATES } = require('../job-states');
const { getAuthHeaders } = require('../utils');

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
    return Response.success({ jobId: data.id });
  } catch (error) {
    return Response.error('Failed to start job', { error });
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
      `${job.featuresValues.endpoint.url}/public/api/projects/${job.featuresValues.project.id}/jobs/${instance.payload.jobId}/abort/`,
      {},
      getAuthHeaders(job.featuresValues)
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
    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/public/api/projects/${job.featuresValues.project.id}/jobs/${instance.payload.jobId}/`,
      getAuthHeaders(job.featuresValues)
    );

    return Response.success(JOB_STATES[data.baseStatus.state] || JobStatus.AWAITING);
  } catch (error) {
    return Response.error(`Failed to get status for dataset ${job.featuresValues.dataset.id}`, { error });
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
    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/public/api/projects/${job.featuresValues.project.id}/jobs/${instance.payload.jobId}/log/`,
      getAuthHeaders(job.featuresValues)
    );

    const logsLines = data.split('\n');

    return Response.success(logsLines.map((logLine) => Log(logLine)));
  } catch (error) {
    return Response.error(`Failed to get log for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
