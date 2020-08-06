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
              containers: job.featuresValues.service.data.spec.template.spec.containers,
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
 * Logic to delete a new GCP Cloud Run service (NOT USED FOR THE MOMENT)
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.delete = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    let selfLink = job.featuresValues.service.data.metadata.selfLink;

    if (
      instance
      && instance.payload
      && instance.payload.data
      && instance.payload.data.metadata
      && instance.payload.data.metadata.selfLink
    ) {
      selfLink = instance.payload.data.metadata.selfLink;
    }

    await axios.delete(
      `https://${job.featuresValues.region.id}-run.googleapis.com${selfLink}`,
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, 'Failed to delete GCP Cloud Run service');
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

    let selfLink = job.featuresValues.service.data.metadata.selfLink;

    if (
      instance
      && instance.payload
      && instance.payload.data
      && instance.payload.data.metadata
      && instance.payload.data.metadata.selfLink
    ) {
      selfLink = instance.payload.data.metadata.selfLink;
    }

    const { data: { status } } = await axios.get(
      `https://${job.featuresValues.region.id}-run.googleapis.com${selfLink}`,
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

    let serviceName = job.featuresValues.service.data.metadata.name;

    if (
      instance
      && instance.payload
      && instance.payload.data
      && instance.payload.data.metadata
      && instance.payload.data.metadata.name
    ) {
      serviceName = instance.payload.data.metadata.name;
    }
    
    const resLogging = await logging.entries.list({
      requestBody: {
        filter: `resource.type="cloud_run_revision" resource.labels.service_name="${serviceName}" resource.labels.location="${job.featuresValues.region.id}"`,
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
