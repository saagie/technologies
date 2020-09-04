const { Response, JobStatus } = require('@saagie/sdk');
const moment = require('moment-timezone');
const { google } = require('googleapis');
const storagetransfer = google.storagetransfer('v1');
const { getAuth, getErrorMessage } = require('../utils');
const { JOB_STATUS } = require('../job-states');

/**
 * Logic to start a new GCP Cloud Data Transfer job.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 */
exports.start = async ({ job }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    const currentDate = moment();

    const runObject = {
      projectId : job.featuresValues.project.id,
      description: job.featuresValues.jobName,
      status: 'ENABLED',
      schedule: {
        scheduleStartDate: {
          day: currentDate.day(),
          month: currentDate.month(),
          year: currentDate.year()
        },
      },
      transferSpec: {
        httpDataSource: {
          listUrl: job.featuresValues.tsvFileURL,
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
    };

    if (job.featuresValues.dailyExecutionHour && job.featuresValues.dailyExecutionHour.length > 0) {
      // DAILY RUN IF DAILY EXECUTION HOUR HAS BEEN INSERTED
      const dailyHour = moment(job.featuresValues.dailyExecutionHour, 'HH:mm');

      if (!dailyHour.isValid()) {
        return Response.error('Error while parsing the daily execution hour', new Error('Error while parsing the daily execution hour'));
      }

      const dailyHourUTC = dailyHour.utc();

      if (dailyHourUTC) {
        runObject.schedule.startTimeOfDay = {
          hours: dailyHourUTC.hour(),
          minutes: dailyHourUTC.minute(),
          seconds: 0,
          nanos: 0,
        };
      }
    } else {
      // RUN EXECUTED ONCE
      runObject.schedule.scheduleEndDate = {
        day: currentDate.day(),
        month: currentDate.month(),
        year: currentDate.year()
      };
    }

    const { data } = await storagetransfer.transferJobs.create({
      auth,
      requestBody: runObject
    });

    return Response.success({ data });
  } catch (error) {
    return getErrorMessage(error, 'Failed to run GCP Cloud Data Transfer job');
  }
};

/**
 * Logic to stop the GCP Cloud Data Transfer job
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    const filterOptions = {
      project_id: job.featuresValues.project.id,
      job_names: [instance.payload.data.name]
    };
  
    const filterOptionsString = JSON.stringify(filterOptions);
  
    // WE LIST ALL TRANSFER OPERATIONS LINKED TO TRANSFER JOB
    const { data: { operations } } = await storagetransfer.transferOperations.list({
      auth,
      name: 'transferOperations',
      filter: filterOptionsString
    });

    let promises = [];
  
    if (operations && operations.length > 0) {
      promises = operations.map(async (operation) => {
        await storagetransfer.transferOperations.cancel({
          auth,
          name: operation.name
        });
      });
    }

    // WE CANCEL ALL TRANSFER OPERATIONS LINKED TO TRANSFER JOB
    await Promise.all(promises);

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, 'Failed to stop GCP Cloud Data Transfer job');
  }
};

/**
 * Logic to retrieve the GCP Cloud Data Transfer job status.
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

    // WE LIST ALL TRANSFER OPERATIONS LINKED TO TRANSFER JOB
    const { data: { operations } } = await storagetransfer.transferOperations.list({
      auth,
      name: 'transferOperations',
      filter: filterOptionsString
    });

    if (operations && operations.length > 0) {
      // WE GET LAST OPERATION STATUS
      const { metadata } = operations[operations.length - 1];

      return Response.success(JOB_STATUS[metadata.status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, 'Failed to get status for GCP Cloud Data Transfer job ');
  }
};

exports.getLogs = () => {};
