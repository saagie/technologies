const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const { google } = require('googleapis');
const ml = google.ml('v1');
const logging = google.logging('v2');
const { getAuth } = require('./utils');
const { JOB_STATUS } = require('./job-states');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);
    
    const auth = getAuth(gcpKey);

    if (!job.featuresValues.newJobName) {
      return Response.error("You need to select", new E);
    }

    const { data } = await ml.projects.jobs.create({
      auth,
      parent: `projects/${job.featuresValues.project.id}`,
      requestBody: {
        jobId: job.featuresValues.newJobName,
        trainingInput: job.featuresValues.job.data && job.featuresValues.job.data.trainingInput,
        trainingOutput: job.featuresValues.job.data && job.featuresValues.job.data.trainingOutput,
        predictionInput: job.featuresValues.job.data && job.featuresValues.job.data.predictionInput,
        predictionOutput: job.featuresValues.job.data && job.featuresValues.job.data.predictionOutput,
      }
    });

    return Response.success(data);
  } catch (error) {
    return getErrorMessage(error, "Failed to start job");
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
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);
    
    const auth = getAuth(gcpKey);
    
    let jobId = null;

    if (
      instance
      && instance.payload
      && instance.payload.jobId
    ) {
      jobId = instance.payload.jobId;
    } else {
      jobId = job.featuresValues.job.id;
    }
    
    await ml.projects.jobs.cancel({
      auth,
      name: `projects/${job.featuresValues.project.id}/jobs/${jobId}`,
    });
    
    return Response.success();
  } catch (error) {
    return getErrorMessage(error, "Failed to stop job");
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
    
    const auth = getAuth(gcpKey);

    let jobId = null;

    if (
      instance
      && instance.payload
      && instance.payload.jobId
    ) {
      jobId = instance.payload.jobId;
    } else {
      jobId = job.featuresValues.job.id;
    }

    const { data } = await ml.projects.jobs.get({
      auth,
      name: `projects/${job.featuresValues.project.id}/jobs/${jobId}`,
    });

    return Response.success(JOB_STATUS[data.state] || JobStatus.AWAITING);
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

    let jobId = null;

    if (
      instance
      && instance.payload
      && instance.payload.jobId
    ) {
      jobId = instance.payload.jobId;
    } else {
      jobId = job.featuresValues.job.id;
    }

    const resLogging = await logging.entries.list({
      requestBody: {
        filter: `resource.labels.job_id="${jobId}"`,
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
