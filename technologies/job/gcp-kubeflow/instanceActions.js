const { Response, JobStatus, Log } = require('@saagie/sdk');
const axios = require('axios');
const { getErrorMessage, getHeadersWithAccessToken } = require('./utils');
const { JOB_STATUS } = require('./job-states');

/**
 * Logic to stop the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
export const stop = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { run } = instance.payload;

    await axios.post(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs/${run.id}/terminate`,
      {},
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, "Failed to start job");
  }
};

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
export const getStatus = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { run } = instance.payload;

    const { data } = await axios.get(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs/${run.id}`,
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success(JOB_STATUS[data.run.status] || JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, "Failed to get status for job");
  }
};

/**
 * Logic to retrieve the external job instance logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
export const getLogs = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { run } = instance.payload;

    const headers = await getHeadersWithAccessToken(gcpKey);

    const { data } = await axios.get(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs/${run.id}`,
      headers,
    );

    const workflowJson = data.pipeline_runtime.workflow_manifest;

    const workflowObj = JSON.parse(workflowJson);

    const { nodes } = workflowObj.status;

    const nodesArray = Object.values(nodes);

    const pods = nodesArray.filter(node => node.type === 'Pod');

    pods.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

    const logsPromises = pods.map(async (pod) => {
      let logsData = '';

      try {
        const { data } = await axios.get(
          `${job.featuresValues.endpoint.instanceUrl}/k8s/pod/logs?podname=${pod.id}`,
          headers,
        );

        if (data) {
          logsData = data;
        }
      } catch (e) {
        console.warn(`Error while getting logs for pod = ${pod.id}`);
      }

      return logsData;
    });

    const logs = await Promise.all(logsPromises);

    const logsLines = logs.reduce((acc, logData) => {
      return acc.concat(logData.split('\n'));
    }, []);

    return Response.success(logsLines.map(log => Log(log)));
  } catch (error) {
    return getErrorMessage(error, "Failed to get logs for job");
  }
};