const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const { google } = require('googleapis');
const dataflow = google.dataflow('v1b3');
const logging = google.logging('v2');
const { getAuth, getErrorMessage } = require('../utils');
const { JOB_STATUS } = require('../job-states');

/**
 * Logic to start a new job (clone the selected one)
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    // Getting current job details and options
    const { data: jobData } = await dataflow.projects.locations.jobs.get({
      auth,
      projectId : job.featuresValues.project.id,
      location : job.featuresValues.region.id,
      jobId: job.featuresValues.job.id,
      view: 'JOB_VIEW_DESCRIPTION',
    });

    const { pipelineDescription: { displayData: jobOptions } } = jobData;

    const gcsPath = jobOptions.find((option) => option.key === 'templateLocation').strValue;

    // Getting current job template details and accepted parameters
    const { data: templateData } = await dataflow.projects.locations.templates.get({
      auth,
      projectId : job.featuresValues.project.id,
      location : job.featuresValues.region.id,
      gcsPath
    });

    const availableTemplateParameters = templateData.metadata.parameters;

    const parameters = {};

    // Filter only accepted parameters on job template
    jobOptions.forEach((option) => {
      if (availableTemplateParameters.find((param) => param.name === option.key)) {
        parameters[option.key] = option.strValue;
      }
    });

    // Launch a new job with selected job parameters
    const { data: { job: newJob } } = await dataflow.projects.locations.templates.launch({
      auth,
      projectId : job.featuresValues.project.id,
      location : job.featuresValues.region.id,
      gcsPath,
      requestBody: {
        jobName: job.featuresValues.clonedJobName || job.featuresValues.job.label,
        parameters: parameters,
      }
    });

    return Response.success({ newJob });
  } catch (error) {
    return getErrorMessage(error, 'Failed to run GCP Dataflow job');
  }
};

/**
 * Logic to stop the job
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    let jobId = job.featuresValues.job.id;

    if (instance && instance.payload && instance.payload.newJob.id) {
      jobId = instance.payload.newJob.id;
    }

    await dataflow.projects.locations.jobs.update({
      auth,
      projectId : job.featuresValues.project.id,
      location : job.featuresValues.region.id,
      jobId,
      requestBody: {
        requestedState: 'JOB_STATE_CANCELLED',
      },
    });

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, 'Failed to stop GCP Dataflow job');
  }
};

/**
 * Logic to retrieve the Dataflow job status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    let jobId = job.featuresValues.job.id;

    if (instance && instance.payload && instance.payload.newJob.id) {
      jobId = instance.payload.newJob.id;
    }

    const { data } = await dataflow.projects.locations.jobs.get({
      auth,
      projectId : job.featuresValues.project.id,
      location : job.featuresValues.region.id,
      jobId,
    });

    return Response.success(JOB_STATUS[data.currentState] || JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, 'Failed to get status for GCP Dataflow job ');
  }
};

/**
 * Logic to retrieve the Dataflow job logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    let jobId = job.featuresValues.job.id;

    if (instance && instance.payload && instance.payload.newJob.id) {
      jobId = instance.payload.newJob.id;
    }
    
    const resLogging = await logging.entries.list({
      requestBody: {
        filter: `resource.type="dataflow_step" resource.labels.job_id="${jobId}" logName="projects/${job.featuresValues.project.id}/logs/dataflow.googleapis.com%2Fjob-message"`,
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
    return getErrorMessage(error, 'Failed to get logs for GCP Dataflow job');
  }
};
