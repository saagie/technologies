const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const util = require('util')
const moment = require('moment');
const { google } = require('googleapis');
const { Storage } = require('@google-cloud/storage');

// Instantiate a storagetransfer client
const storagetransfer = google.storagetransfer('v1');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    // -----------------------
    // ------ DEBUG ----------
    // -----------------------
    console.log('START instance:', instance);
    // -----------------------
    // ------ DEBUG ----------
    // -----------------------

    if (job.featuresValues === undefined || job.featuresValues.action === undefined) {
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      console.log('You need to pick an action');
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      return Response.error('You need to pick an action');
    } else {
      console.log('Action selected:');
      console.log(job.featuresValues.action);
    }

    if (job.featuresValues === undefined
      || job.featuresValues.endpoint === undefined
      || job.featuresValues.endpoint.jsonKey === undefined) {
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      console.log('You must provide a JSON key');
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      return Response.error('You must provide a JSON key');
    }

    if (job.featuresValues.action) {
      if (job.featuresValues.action.id == 'create') {
        console.log('Creating new job...');
        createTransferJob(
          {
            srcBucket: job.featuresValues.endpoint.sourceBucket,
            destBucket: job.featuresValues.endpoint.destinationBucket,
            time: job.featuresValues.endpoint.transferTime,
            date: job.featuresValues.endpoint.transferDate,
            description: job.featuresValues.endpoint.description,
            jsonKey: job.featuresValues.endpoint.jsonKey,
          },
          Response
        );
      } else if (job.featuresValues.action.id == 'disable') {
        console.log('Action selected:');
        console.log(job.featuresValues.action.id);
        console.log('Disabling job: %s', job.featuresValues.jobList.id);
        updateTransferJob(
          {
            jobName: job.featuresValues.jobList.id,
            jsonKey: job.featuresValues.endpoint.jsonKey,
            newStatus: 'DISABLED',
          },
          Response
        );
      } else if (job.featuresValues.action.id == 'enable') {
        console.log('Action selected:');
        console.log(job.featuresValues.action.id);
        console.log('Enabling job: %s', job.featuresValues.jobList.id);
        updateTransferJob(
          {
            jobName: job.featuresValues.jobList.id,
            jsonKey: job.featuresValues.endpoint.jsonKey,
            newStatus: 'ENABLED',
          },
          Response
        );
      } else if (job.featuresValues.action.id == 'delete') {
        console.log('Action selected:');
        console.log(job.featuresValues.action.id);
        console.log('Deleting job: %s', job.featuresValues.jobList.id);
        updateTransferJob(
          {
            jobName: job.featuresValues.jobList.id,
            jsonKey: job.featuresValues.endpoint.jsonKey,
            newStatus: 'DELETED',
          },
          Response
        );
      }
      // You can return any payload you want to get in the stop and getStatus functions.
      // return Response.success({ customId: job.featuresValues.action.id });
      return Response.success("Selected action: ", job.featuresValues.action.id);
    }
  } catch (error) {
    console.log(error);
    return Response.error('Failed to start job');
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
    // -----------------------
    // ------ DEBUG ----------
    // -----------------------
    console.log('STOP instance:', instance);
    // -----------------------
    // ------ DEBUG ----------
    // -----------------------

    if (job.featuresValues === undefined || job.featuresValues.jobList === undefined) {
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      console.log('You must select a job');
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      return Response.error('You must select a job');
    } else {
      console.log('Job selected:');
      console.log(job.featuresValues.jobList);
    }

    if (job.featuresValues === undefined
      || job.featuresValues.endpoint === undefined
      || job.featuresValues.endpoint.jsonKey === undefined) {
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      console.log('You must provide a JSON key');
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      return Response.error('You must provide a JSON key');
    }

    console.log('Creating new job...');
    cancelTransferJob(
      {
        jobName: job.featuresValues.jobList.id,
        jsonKey: job.featuresValues.endpoint.jsonKey,
      },
      Response
    );

    return Response.success("Canceled job: ", job.featuresValues.jobList.id);
  } catch (error) {
    console.log(error);
    return Response.error('Failed to stop job');
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
    console.log('STATUS INSTANCE:');
    console.log('STATUS job:', util.inspect(job, false, null, true /* enable colors */))

    console.log('JSON key:');
    console.log(job.featuresValues.endpoint.jsonKey);

    if (job === undefined || job.featuresValues === undefined
      || job.featuresValues.endpoint === undefined || job.featuresValues.endpoint.jsonKey === undefined) {
      console.log('Cannot get to job.featuresValues.endpoint.jsonKey');
    }
    const keys = JSON.parse(job.featuresValues.endpoint.jsonKey);

    authClient = new google.auth.JWT({
      email: keys.client_email,
      key: keys.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    console.log('authClient:');
    console.log(authClient);

    if (job === undefined || job.featuresValues === undefined
      || job.featuresValues.jobList === undefined) {
      console.log('Cannot get to job.featuresValues.jobList');
    } else {
      console.log('Before building the request');
      console.log(job.featuresValues.jobList);
    }

    const request = {
      // Required. The name of job to update.
      projectId: keys.project_id,
      name: job.featuresValues.jobList.id,
      auth: authClient,
    };

    // -----------------------
    // ------ DEBUG ----------
    // -----------------------
    console.log('Content of request:');
    console.log(util.inspect(request, false, null, true /* enable colors */))
    // -----------------------
    // ------ DEBUG ----------
    // -----------------------

    let response;
    do {
      if (response && response.nextPageToken) {
        request.pageToken = response.nextPageToken;
      }

      console.log('Before toragetransfer.transferOperations.list(request)');
      response = await storagetransfer.transferOperations.list(request);
      console.log('After toragetransfer.transferOperations.list(request)');
      console.log('response:');
      console.log(response);
      const operationsPage = response.operations;
      if (operationsPage) {
        for (let i = 0; i < operationsPage.length; i++) {
          // TODO: Change code below to process each resource in `operationsPage`:
          console.log(JSON.stringify(operationsPage[i], null, 2));
        }
      }
    } while (response.nextPageToken);

    // let data;
    // storagetransfer.transferOperations.get(
    //   request,
    //   (err, response) => {
    //     // -----------------------
    //     // ------ DEBUG ----------
    //     // -----------------------
    //     console.log('Inside storagetransfer.transferOperations.get');
    //     // -----------------------
    //     // ------ DEBUG ----------
    //     // -----------------------

    //     if (response) {
    //       console.log("------------------");
    //       console.log("---- response ----");
    //       console.log("------------------");
    //       console.log(response);
    //       data = response;
    //     }

    //     if (err) {
    //       console.log("---------------");
    //       console.log("---- Error ----");
    //       console.log("---------------");
    //       console.log(err);
    //       return Response.error('Error:', { err });
    //     }

    //     // const transferJob = response.data;
    //     console.log('Canceled transfer job: %s', options.jobName);
    //     return Response.success('Canceled transfer job: %s', options.jobName);
    //   }
    // );
    switch (data.status) {
      case 'IN_PROGRESS':
        return Response.success(JobStatus.RUNNING);
      case 'STOPPED':
        return Response.success(JobStatus.KILLED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error('Failed to get status', { error });
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
    console.log('LOG INSTANCE:', instance);
    console.log('LOG job:', util.inspect(job, false, null, true /* enable colors */))

    return Response.success('Success!');
    // return Response.success(data.logs.map((item) => Log(item.log, item.output)));
  } catch (error) {
    return Response.error('Failed to get log', { error });
  }
};

/**
 * Review the transfer operations associated with a transfer job.
 *
 * @param {object} options Configuration options.
 * @param {string} options.srcBucket The name of the source bucket.
 * @param {string} options.destBucket The name of the destination bucket.
 * @param {string} options.date The date of the first transfer in the format YYYY/MM/DD.
 * @param {string} options.time The time of the first transfer in the format HH:MM.
 * @param {string} [options.description] Optional. Description for the new transfer job.
 * @param {string} options.jsonKey The JSON key to use for authentication
 */
const createTransferJob = (options, Response) => {
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('-------------------------------------------------------------------------')
  console.log('Entering createTransferJob');
  console.log('Content of options:');
  console.log(util.inspect(options, false, null, true /* enable colors */))
  console.log('-------------------------------------------------------------------------')
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  const startDate = moment(options.date, 'YYYY/MM/DD');
  const transferTime = moment(options.time, 'HH:mm');

  const keys = JSON.parse(options.jsonKey);

  authClient = new google.auth.JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('-------------------------------------------------------------------------')
  console.log('Content of authClient:');
  console.log(util.inspect(authClient, false, null, true /* enable colors */))
  console.log('-------------------------------------------------------------------------')
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  // Prepare the information needed to create a Transfer Job between GCS buckets
  const transferJob = {
    projectId: keys.project_id,
    status: 'ENABLED',
    transferSpec: {
      gcsDataSource: { bucketName: options.srcBucket, },
      gcsDataSink: { bucketName: options.destBucket, },
      transferOptions: { deleteObjectsFromSourceAfterTransfer: false, },
    },
    schedule: {
      scheduleStartDate: {
        year: startDate.year(),
        month: startDate.month() + 1,
        day: startDate.date(),
      },
      startTimeOfDay: {
        hours: transferTime.hours(),
        minutes: transferTime.minutes(),
      },
    },
  };

  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('-------------------------------------------------------------------------')
  console.log('Content of transferJob:');
  console.log(util.inspect(transferJob, false, null, true /* enable colors */))
  console.log('-------------------------------------------------------------------------')
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  if (options.description) {
    transferJob.description = options.description;
  }

  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('Before storagetransfer.transferJobs.create');

  // Get Bucket Metadata
  async function getMetadata() {
    storageOptions = {
      projectId: keys.project_id,
      credentials: {
        client_email: keys.client_email,
        private_key: keys.private_key
      }
    };

    // Create a client
    const storage = new Storage(storageOptions);

    // Gets the metadata for the bucket
    const [metadata] = await storage.bucket(options.srcBucket).getMetadata();
    console.log('------------------------')
    console.log('-- BUCKET INFORMATION --')
    console.log('------------------------')
    console.log(util.inspect(metadata, false, null, true /* enable colors */))
    console.log('----------------------------')
    console.log('-- END BUCKET INFORMATION --')
    console.log('----------------------------')
  }
  getMetadata().catch(console.error);
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------


  async function getServiceAccount() {
    const request = {
      // Required. The ID of the Google Cloud Platform Console project that the
      // Google service account is associated with.
      // This is the service account used to schedule the transfer job and it MUST has access
      // to the GCS buckets.
      projectId: keys.project_id,
      auth: authClient,
    };
    const response = await storagetransfer.googleServiceAccounts.get(request);
    console.log('---------------------')
    console.log('-- SERVICE ACCOUNT --')
    console.log('---------------------')
    console.log('Make sure the following service account has access to the GCS Bucket(s)')
    console.log(response.data.accountEmail);
    console.log('-------------------------')
    console.log('-- END SERVICE ACCOUNT --')
    console.log('-------------------------')
  }
  getServiceAccount().catch(console.error);

  storagetransfer.transferJobs.create(
    {
      auth: authClient,
      resource: transferJob,
    },
    (err, response) => {
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      console.log('Inside (err, response)');
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------

      if (err) {
        console.log("---------------");
        console.log("---- Error ----");
        console.log("---------------");
        console.log(err);
        return Response.error('Error:', { err });
      }

      const transferJob = response.data;
      console.log('Created transfer job: %s', transferJob.name);
      return Response.success('Created transfer job: %s', transferJob.name);
    }
  );
}

const updateTransferJob = (options, Response) => {
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('-------------------------------------------------------------------------')
  console.log('Entering updateTransferJob');
  console.log('Content of options:');
  console.log(util.inspect(options, false, null, true /* enable colors */))
  console.log('-------------------------------------------------------------------------')
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  const keys = JSON.parse(options.jsonKey);

  authClient = new google.auth.JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('-------------------------------------------------------------------------')
  console.log('Content of authClient:');
  console.log(util.inspect(authClient, false, null, true /* enable colors */))
  console.log('-------------------------------------------------------------------------')
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  const request = {
    // Required. The name of job to update.
    jobName: options.jobName,
    projectId: keys.project_id,
    resource: {
      transferJob: {
        status: options.newStatus
      },
      updateTransferJobFieldMask: "status"
    },
    auth: authClient,
  };

  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('Content of request:');
  console.log(util.inspect(request, false, null, true /* enable colors */))
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  storagetransfer.transferJobs.patch(
    request,
    (err, response) => {
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      console.log('Inside storagetransfer.transferJobs.patch');
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------

      if (err) {
        console.log("---------------");
        console.log("---- Error ----");
        console.log("---------------");
        console.log(err);
        return Response.error('Error:', { err });
      }

      const transferJob = response.data;
      console.log('Updated transfer job: %s', transferJob.name);
      return Response.success('Updated transfer job: %s', transferJob.name);
    }
  );
};

const cancelTransferJob = (options, Response) => {
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('-------------------------------------------------------------------------')
  console.log('Entering cancelTransferJob');
  console.log('Content of options:');
  console.log(util.inspect(options, false, null, true /* enable colors */))
  console.log('-------------------------------------------------------------------------')
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  const keys = JSON.parse(options.jsonKey);

  authClient = new google.auth.JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('-------------------------------------------------------------------------')
  console.log('Content of authClient:');
  console.log(util.inspect(authClient, false, null, true /* enable colors */))
  console.log('-------------------------------------------------------------------------')
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  const request = {
    // Required. The name of job to update.
    name: options.jobName,
    auth: authClient,
  };

  // -----------------------
  // ------ DEBUG ----------
  // -----------------------
  console.log('Content of request:');
  console.log(util.inspect(request, false, null, true /* enable colors */))
  // -----------------------
  // ------ DEBUG ----------
  // -----------------------

  storagetransfer.transferOperations.cancel(
    request,
    (err, response) => {
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------
      console.log('Inside storagetransfer.transferOperations.cancel');
      // -----------------------
      // ------ DEBUG ----------
      // -----------------------

      if (response) {
        console.log("------------------");
        console.log("---- response ----");
        console.log("------------------");
        console.log(response);
      }

      if (err) {
        console.log("---------------");
        console.log("---- Error ----");
        console.log("---------------");
        console.log(err);
        return Response.error('Error:', { err });
      }

      // const transferJob = response.data;
      console.log('Canceled transfer job: %s', options.jobName);
      return Response.success('Canceled transfer job: %s', options.jobName);
    }
  );
};