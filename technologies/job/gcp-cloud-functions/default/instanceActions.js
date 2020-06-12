const { Response, JobStatus, Log } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudfunctions = google.cloudfunctions('v1');
const logging = google.logging('v2');
const { getAuth, getErrorMessage } = require('./utils');
const { JOB_STATUS } = require('./job-states');

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    console.log(`Retrieve status for ${job.featuresValues.function.id}`)
    const { data } = await cloudfunctions.projects.locations.functions.get({
      auth,
      name : job.featuresValues.function.id,
    });

    return Response.success(JOB_STATUS[data.status] || JobStatus.KILLED);
  } catch (error) {
    return getErrorMessage(error, `Failed to get status for GCP Cloud function ${job.featuresValues.function.id}`);
  }
};

/**
 * Logic to retrieve the external job instance logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    const resLogging = await logging.entries.list({
      requestBody: {
        filter: `resource.type=cloud_function resource.labels.function_name=${job.featuresValues.function.label} resource.labels.region=${job.featuresValues.region.id} log_name=projects/${job.featuresValues.project.id}/logs/cloudfunctions.googleapis.com%2Fcloud-functions`,
        orderBy: "timestamp desc",
        resourceNames: [`projects/${job.featuresValues.project.id}`]
      }, 
      auth
    });

    if (
      resLogging
      && resLogging.data
      && resLogging.data.entries
      && resLogging.data.entries.length > 0
    ) {
      return Response.success(resLogging.data.entries.reverse().map(({timestamp, textPayload}) => Log(textPayload, "", timestamp)));  
    }

    return Response.empty();
  } catch (error) {
    return getErrorMessage(error, `Failed to get logs for ${job.featuresValues.function.label}`);
  }
};
