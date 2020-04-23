const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    const result = await axios.post(
      `${job.featuresValues.endpoint.url}/rest/v4/jobs/${job.featuresValues.job.id}`,
      {},
      {
        auth: {
          username: job.featuresValues.endpoint.username,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    console.log({ result });

    const { data } = result;

    console.log({ data });

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success(data);
  } catch (error) {
    return Response.error('Fail to start job', { error, url: `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start` });
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

    const result = await axios.get(
      `${job.featuresValues.endpoint.url}/rest/v4/jobs/${job.featuresValues.job.id}`,
      {
        auth: {
          username: job.featuresValues.endpoint.username,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    const { data } = result;

    switch (data.state) {
      case 'EXECUTING':
        return Response.success(JobStatus.RUNNING);
      case 'CONFIGURED_QUEUED':
        return Response.success(JobStatus.QUEUED);
        case 'EXECUTED':
          return Response.success(JobStatus.SUCCEEDED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error('Failed to get status', { error });
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
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/logs`,
    );

    return Response.success(data.logs.map((item) => Log(item.log, item.output, item.time)));
  } catch (error) {
    return Response.error(`Failed to get log for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
