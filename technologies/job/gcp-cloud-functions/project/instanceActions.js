const { Response, JobStatus, Log } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudfunctions = google.cloudfunctions('v1');
const logging = google.logging('v2');
const { getConnexion } = require('./utils');


/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: "" });
  } catch (error) {
    return Response.error('Fail to start job', { error });
  }
};

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    authClient = getConnexion(gcpKey);

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
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    authClient = getConnexion(gcpKey);

    const { data: { entries }} = await logging.entries.list({
      requestBody: {
        filter: `resource.type=cloud_function resource.labels.function_name=${job.featuresValues.function.label} resource.labels.region=${job.featuresValues.endpoint.location.id} log_name=projects/saagie-internal-testing/logs/cloudfunctions.googleapis.com%2Fcloud-functions`,
        orderBy: "timestamp desc",
        resourceNames: ["projects/saagie-internal-testing"]
      }, 
      auth: authClient
    });
    console.log(entries)
    return Response.success(entries.reverse().map(({timestamp, textPayload}) => Log(textPayload, "", timestamp)));  
  } catch (error) {
    return Response.error(`Failed to get log for ${job.featuresValues.function.name}}`, { error });
  }
};
