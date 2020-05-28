const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const { google } = require("googleapis");
const cloudfunctions = google.cloudfunctions('v1');


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
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    authClient = new google.auth.JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    console.log(`Retrieve status for ${job.featuresValues.function.id}`)
    const { data } = await cloudfunctions.projects.locations.functions.get({
      auth: authClient,
      name : `${job.featuresValues.function.id}`,
    });

    switch (data.status) {
      case 'ACTIVE':
        return Response.success(JobStatus.RUNNING);
      case 'OFFLINE':
        return Response.success(JobStatus.FAILED);
      case 'DEPLOY_IN_PROGRESS':
        return Response.success(JobStatus.AWAITING);
      default:
        return Response.success(JobStatus.KILLED);
    }
  } catch (error) {
    return Response.error(`Failed to get status for GCP Cloud function ${job.featuresValues.function.id}`, { error });
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
