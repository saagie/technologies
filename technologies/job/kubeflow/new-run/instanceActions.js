const { Response, JobStatus, Log } = require('@saagie/sdk');
const axios = require('axios');
const { getErrorMessage, getHeadersWithAccessToken } = require('../utils');
const { JOB_STATUS } = require('../job-states');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const pipelineSpec = {
      pipeline_id: job.featuresValues.pipeline.id,
    };

    if (job.featuresValues.runParameters) {
      const runParameters = JSON.parse(job.featuresValues.runParameters);
      pipelineSpec.parameters = runParameters;
    }
    
    const { data } = await axios.post(
      `http://${job.featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/runs`,
      {
        name: job.featuresValues.runName,
        description: job.featuresValues.runDescription,
        pipeline_spec: pipelineSpec,
      },
      await getHeadersWithAccessToken(job.featuresValues),
    );

    return Response.success(data);
  } catch (error) {
    return getErrorMessage(error, "Failed to start job");
  }
};

/**
 * Logic to stop the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.stop = async ({ job, instance }) => {
  try {
    const { run } = instance.payload;

    await axios.post(
      `http://${job.featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/runs/${run.id}/terminate`,
      {},
      await getHeadersWithAccessToken(job.featuresValues),
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
exports.getStatus = async ({ job, instance }) => {
  try {
    const { run } = instance.payload;

    const { data } = await axios.get(
      `http://${job.featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/runs/${run.id}`,
      await getHeadersWithAccessToken(job.featuresValues),
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
exports.getLogs = async ({ job, instance }) => {
  try {
    const { run } = instance.payload;

    const { data } = await axios.get(
      `http://${job.featuresValues.endpoint.instanceUrl}/pipeline/apis/v1beta1/runs/${run.id}`,
      await getHeadersWithAccessToken(job.featuresValues),
    );

    const workflowJson = data.pipeline_runtime.workflow_manifest;

    const workflowObj = JSON.parse(workflowJson);

    const { nodes } = workflowObj.status;

    const nodesArray = Object.values(nodes);

    const pods = nodesArray.filter(node => node.type === 'Pod');

    const logsPromises = pods.map(async (pod) => {
      const { data: logsData } = await axios.get(
        `http://${job.featuresValues.endpoint.instanceUrl}/pipeline/k8s/pod/logs?podname=${pod.id}`,
        await getHeadersWithAccessToken(job.featuresValues),
      );

      return logsData;
    });

    const logs = await Promise.all(logsPromises);

    return Response.success(logs.map(log => Log(log)));
  } catch (error) {
    return getErrorMessage(error, "Failed to get logs for job");
  }
};
