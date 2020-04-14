const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const AWS = require('aws-sdk');
const axios = require('axios');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    const { data } = await axios.post(
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start`,
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: data.id });
  } catch (error) {
    return Response.error('Fail to start job', { error, url: `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start` });
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

    console.log(job);

    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});

    console.log("---");

    const eventsourcemappingList =  await lambda.listEventSourceMappings({FunctionName : job.featuresValues.functions.id }).promise();

    console.log(eventsourcemappingList);

    if (!eventsourcemappingList.EventSourceMappings || !data.EventSourceMappings.length) {
      return Response.empty('No functions with kinesis, SQS or DynamoDB availables');
    }
    const eventsourcemapping =  await lambda.getEventSourceMapping({UUID : "arn:aws:lambda:eu-central-1:494897648197:function:lambdaNode1" }).promise();

    console.log(eventsourcemapping);

    console.log("====");

    switch (data.status) {
      case 'IN_PROGRESS':
        return Response.success(JobStatus.RUNNING);
      case 'STOPPED':
        return Response.success(JobStatus.KILLED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get status for dataset ${job.featuresValues.functions.id}`, { error });
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
