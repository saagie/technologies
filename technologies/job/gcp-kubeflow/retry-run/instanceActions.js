const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const { google } = require('googleapis');
const logging = google.logging('v2');
const axios = require('axios');
const { getAuth, getErrorMessage, getHeadersWithAccessToken } = require('../utils');
const { JOB_STATUS } = require('../job-states');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);
    
    await axios.post(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs/${job.featuresValues.run.id}/retry`,
      {},
      await getHeadersWithAccessToken(gcpKey),
    );

    return Response.success({ run: job.featuresValues.run });
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
exports.getStatus = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);
    
    const { run } = instance.payload;

    const { data } = await axios.get(
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
exports.getLogs = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);
    
    const { run } = instance.payload;

    const { data } = await axios.get(
      `${job.featuresValues.endpoint.instanceUrl}/apis/v1beta1/runs/${run.id}`,
      await getHeadersWithAccessToken(gcpKey),
    );

    const manifest = JSON.parse(data.run.pipeline_spec.workflow_manifest);

    const podName = manifest.metadata.generateName;

    const resLogging = await logging.entries.list({
      requestBody: {
        filter: `resource.type="k8s_container" resource.labels.pod_name:"${podName}"`,
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
      return Response.success(
        resLogging.data.entries
          .reverse()
          .map(({
            timestamp,
            jsonPayload,
            textPayload
          }) => {
            let logContent = textPayload;

            if (jsonPayload && jsonPayload.levelname && jsonPayload.message) {
              logContent = `[${jsonPayload.levelname}] - ${jsonPayload.message}`;
            } else if (jsonPayload && jsonPayload.message) {
              logContent = jsonPayload.message;
            }

            return Log(logContent, Stream.STDOUT, timestamp);
          }));
    }

    return Response.empty();
  } catch (error) {
    return getErrorMessage(error, "Failed to get logs for job");
  }
};
