const { Response, JobStatus } = require('@saagie/sdk');
const dayjs = require('dayjs');
const { google } = require('googleapis');
const storagetransfer = google.storagetransfer('v1');
const { getAuth, getErrorMessage } = require('../utils');
const { JOB_STATUS } = require('../job-states');

/**
 * Logic to start a new job.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    const currentDate = dayjs();

    const { data } = await storagetransfer.transferJobs.create({
      auth,
      requestBody: {
        projectId : job.featuresValues.project.id,
        description: job.featuresValues.jobName,
        status: 'ENABLED',
        schedule: {
          scheduleStartDate: {
            day: currentDate.day(),
            month: currentDate.month(),
            year: currentDate.year()
          },
          scheduleEndDate: {
            day: currentDate.day(),
            month: currentDate.month(),
            year: currentDate.year()
          }
        },
        transferSpec: {
          gcsDataSource: {
            bucketName: job.featuresValues.sourceBucket.id,
          },
          gcsDataSink: {
            bucketName: job.featuresValues.destinationBucket.id,
          },
          transferOptions: {
            deleteObjectsFromSourceAfterTransfer: false,
            deleteObjectsUniqueInSink: false,
            overwriteObjectsAlreadyExistingInSink: false
          }
        }
      }
    });

    return Response.success({ data });
  } catch (error) {
    return getErrorMessage(error, 'Failed to run GCP Cloud Data Transfer job');
  }
};

/**
 * Logic to stop the job
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async () => {
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

    const filterOptions = {
      project_id: job.featuresValues.project.id,
      job_names: [instance.payload.data.name]
    };

    const filterOptionsString = JSON.stringify(filterOptions);

    const { data: { operations } } = await storagetransfer.transferOperations.list({
      auth,
      name: 'transferOperations',
      filter: filterOptionsString
    });

    if (operations && operations.length > 0) {
      const { metadata } = operations[operations.length - 1];

      return Response.success(JOB_STATUS[metadata.status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
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
exports.getLogs = async () => {
};
