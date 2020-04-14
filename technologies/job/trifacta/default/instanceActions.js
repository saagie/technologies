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
    const { data } = await axios.post(
      `${job.featuresValues.endpoint.url}/v4/jobGroups`,
      {
        wrangledDataset: {
          id: job.featuresValues.dataset.id,
        },
      },
      {
        auth: {
          username: job.featuresValues.endpoint.mail,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ jobGroupId: data.id });
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
    await axios.delete(
      `${job.featuresValues.endpoint.url}/v4/jobGroups/${instance.payload.jobGroupId}`,
      {
        auth: {
          username: job.featuresValues.endpoint.mail,
          password: job.featuresValues.endpoint.password
        }
      }
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
      `${job.featuresValues.endpoint.url}/v4/jobGroups/${instance.payload.jobGroupId}/status`,
      {
        auth: {
          username: job.featuresValues.endpoint.mail,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    switch (data) {
      case 'Created':
        return Response.success(JobStatus.QUEUED);
      case 'Pending':
        return Response.success(JobStatus.QUEUED);
      case 'InProgress':
        return Response.success(JobStatus.RUNNING);
      case 'Complete':
        return Response.success(JobStatus.SUCCEEDED);
      case 'Canceled':
        return Response.success(JobStatus.KILLED);
      case 'Failed':
        return Response.success(JobStatus.FAILED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
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
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/logs`,
    );

    return Response.success(data.logs.map((item) => Log(item.log, item.output)));
  } catch (error) {
    return Response.error(`Failed to get log for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
