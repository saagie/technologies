const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const AWS = require('aws-sdk');

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

    const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});

    // Start all trigger/eventsource
    var dataList = job.featuresValues.functions.sourceId.map(
    (value) =>
      lambda.updateEventSourceMapping({
        Enabled: true, 
        FunctionName: job.featuresValues.functions.id,
        UUID: value
      }).promise().then((data) => {return data.State; })
    );
    dataList=await Promise.all(dataList);

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({});
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
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});

    // Stop all trigger/eventsource
    var dataList = job.featuresValues.functions.sourceId.map(
      (value) =>
        lambda.updateEventSourceMapping({
          Enabled: false, 
          FunctionName: job.featuresValues.functions.id,
          UUID: value
        }).promise().then((data) => { return data.State; })
    );
    dataList=await Promise.all(dataList);

    return Response.success();
  } catch (error) {
    console.log(error);
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

    const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});

    var statusList = job.featuresValues.functions.sourceId.map(
      (value) =>
        lambda.getEventSourceMapping({UUID: value }).promise().then((data) => {
          return ({
              uuid: value,
              status: data.State
            })
          }
    ));
    statusList=await Promise.all(statusList);

    // Computing worst case status if a lambda got different triggers/eventsource
    const xrefStatus=function(status) {
      switch (status) {
        case 'Creating':
          return 30
        case 'Enabling':
          return 10
        case 'Enabled':
          return 0
        case 'Disabling':
          return 40
        case 'Disabled':
          return 50
        case 'Updating':
          return 20;
        case 'Deleting':
          return 60; 
      }
    }
    const status=statusList.reduce((consolidated, item) => {
      if (xrefStatus(item.status) > xrefStatus(consolidated))
        return item.status;
      else
        return consolidated;
    },"Enabled");

    // Existing status : Creating, Enabling, Enabled, Disabling, Disabled, Updating, or Deleting
    switch (status) {
      case 'Creating':
        return Response.success(JobStatus.REQUESTED);
      case 'Enabling':
        return Response.success(JobStatus.QUEUED);
      case 'Enabled':
        return Response.success(JobStatus.RUNNING);
      case 'Disabling':
          return Response.success(JobStatus.KILLING);
      case 'Disabled':
        return Response.success(JobStatus.KILLED);
     default:
       return Response.success(JobStatus.AWAITING); // Updating or Deleting
    }
  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get status for functions ${job.featuresValues.functions.id}`, { error });
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
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const cwl = new AWS.CloudWatchLogs({apiVersion: '2014-03-28'});

    const paramslogstreams = {
      logGroupName: `/aws/lambda/${job.featuresValues.functions.label}`,
    };

    const logstreams = await cwl.describeLogStreams(paramslogstreams).promise();

    var logs=logstreams.logStreams.map(
      (ls) => 
      cwl.getLogEvents(
        {
          logGroupName: `/aws/lambda/${job.featuresValues.functions.label}`,
          logStreamName: ls.logStreamName
        }
        ).promise().then((data) => {
          return (
              data.events
            )
          }
    ));
    
    logs=(await Promise.all(logs)).flat();

    return Response.success(logs.map((item) => Log(item.message, Stream.STDOUT, new Date(item.timestamp*1000).toISOString())));

  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get log for job ${job.featuresValues.functions.id}`, { error });
  }
};
