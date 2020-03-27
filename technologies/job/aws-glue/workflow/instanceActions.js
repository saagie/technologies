const axios = require('axios');
const { Response, JobStatus } = require('@saagie/sdk');

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
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start`,
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: data.id });
  } catch (error) {
    return Response.error('Fail to start job', { error, url: `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start` });
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
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/stop`,
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
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}`,
    );

    switch (data.status) {
      case 'IN_PROGRESS':
        return Response.success(JobStatus.RUNNING);
      case 'STOPPED':
        return Response.success(JobStatus.KILLED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
