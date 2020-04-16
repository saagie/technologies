const AWS = require('aws-sdk');
const { Response, JobStatus, Log } = require('@saagie/sdk');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const batch = new AWS.Batch({apiVersion: '2016-08-10'});
    
    const data = await batch.submitJob({
      jobDefinition :  job.featuresValues.jobDefinition.id ,
      jobName : `${job.featuresValues.jobDefinition.label}-${instance.id}`,
      jobQueue : job.featuresValues.jobQueue.id
      }).promise();

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: data.jobId });
  } catch (error) {
    console.log(error);
    return Response.error('Fail to start job', { error });
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
    console.log('STOP INSTANCE:', instance);
    await axios.post(
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/stop`,
    );

    return Response.success();
  } catch (error) {
    return Response.error('Fail to stop job', { error });
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
    console.log('GET STATUS INSTANCE:', instance);
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const batch = new AWS.Batch({apiVersion: '2016-08-10'});
    
    const data = await batch.describeJobs({jobs: [ instance.payload.customId ]}).promise();
    
    const JOB_STATES = {
      SUBMITTED: JobStatus.REQUESTED,
      PENDING: JobStatus.QUEUED,
      RUNNABLE: JobStatus.QUEUED,
      STARTING: JobStatus.RUNNING,
      RUNNING: JobStatus.RUNNING,
      SUCCEEDED: JobStatus.SUCCEEDED,
      FAILED: JobStatus.FAILED,
    };
    return Response.success(JOB_STATES[data.jobs[0].status]);
  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get status for job instance ${instance.customId}`, { error });
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
    console.log('GET LOG INSTANCE:', instance);
    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/logs`,
    );

    return Response.success(data.logs.map((item) => Log(item.log, item.output)));
  } catch (error) {
    return Response.error(`Failed to get log for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
