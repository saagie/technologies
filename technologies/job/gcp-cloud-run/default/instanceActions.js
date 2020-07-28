const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const { google } = require('googleapis');
const dataflow = google.dataflow('v1b3');
const logging = google.logging('v2');
const run = google.run('v1');
const { getAuth, getErrorMessage } = require('../utils');
const { JOB_STATUS } = require('../job-states');

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    const res = await run.namespaces.services.create({
      auth,
      parent: `namespaces/${job.featuresValues.project.id}`,
      requestBody: {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        metadata: {
          name: 'test',
          namespace: job.featuresValues.project.id,
        },
        spec: {
          template: {
            spec: {
              containers: [
                {
                  image: 'gcr.io/cloudrun/hello',
                  env: [],
                }
              ],
            },
          },
          traffic: {
            percent: 100,
            latestRevision: true,
          }
        }
      }
    });

    console.log({ res });

    return Response.success();
  } catch (error) {
    console.log(error.response.data);
    console.log(error.response.data.error.errors);
    return getErrorMessage(error, 'Failed to run GCP Dataflow job');
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

    const { data } = await dataflow.projects.locations.jobs.get({
      auth,
      projectId : job.featuresValues.project.id,
      location : job.featuresValues.region.id,
      jobId: instance.payload.newJob.id,
    });

    return Response.success(JOB_STATUS[data.currentState] || JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, 'Failed to get status for GCP Dataflow job ');
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
    
    const resLogging = await logging.entries.list({
      requestBody: {
        filter: `resource.type="dataflow_step" resource.labels.job_id="${instance.payload.newJob.id}" logName="projects/${job.featuresValues.project.id}/logs/dataflow.googleapis.com%2Fjob-message"`,
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
