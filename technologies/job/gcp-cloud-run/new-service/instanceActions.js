const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const { google } = require('googleapis');
const logging = google.logging('v2');
const axios = require('axios');
const { getAuth, getErrorMessage, getHeadersWithAccessToken } = require('../utils');
const { CONDITION_STATUS } = require('../job-states');

/**
 * Logic to start a new GCP Cloud Run service
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { data } = await axios.post(
      `https://${job.featuresValues.region.id}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${job.featuresValues.project.id}/services`,
      {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        metadata: {
          name: job.featuresValues.serviceName,
          namespace: job.featuresValues.project.id,
        },
        spec: {
          template: {
            spec: {
              containers: [
                {
                  image: job.featuresValues.containerImageUrl,
                  env: [],
                }
              ],
            },
          }
        }
      },
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success({ data });
  } catch (error) {
    return getErrorMessage(error, 'Failed to run GCP Cloud Run service');
  }
};

/**
 * Logic to stop a new GCP Cloud Run service
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    await axios.delete(
      `https://${job.featuresValues.region.id}-run.googleapis.com${instance.payload.data.metadata.selfLink}`,
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, 'Failed to stop GCP Cloud Run service');
  }
};


/**
 * Logic to retrieve the GCP Cloud Run service status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const { data: { status } } = await axios.get(
      `https://${job.featuresValues.region.id}-run.googleapis.com${instance.payload.data.metadata.selfLink}`,
      await getHeadersWithAccessToken(gcpKey),
    );

    const { conditions } = status;

    const readyCondition = conditions.find(condition => condition.type === 'Ready');

    if (readyCondition) {
      return Response.success(CONDITION_STATUS[readyCondition.status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, 'Failed to get status for GCP Cloud Run service');
  }
};

/**
 * Logic to retrieve the GCP Cloud Run service logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);
    
    const resLogging = await logging.entries.list({
      requestBody: {
        filter: `resource.type="cloud_run_revision" resource.labels.service_name="${instance.payload.data.metadata.name}" resource.labels.location="${job.featuresValues.region.id}" severity>=DEFAULT`,
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
      return Response.success(resLogging.data.entries.reverse().map(({ timestamp, textPayload }) => Log(textPayload, Stream.STDOUT, timestamp)));  
    }

    return Response.empty();
  } catch (error) {
    return getErrorMessage(error, 'Failed to get logs for GCP Cloud Run service');
  }
};
