const AWS = require('aws-sdk');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');

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

    var stepfunctions = new AWS.StepFunctions({apiVersion: '2016-11-23'});
    
    const data = await stepfunctions.startExecution({
      stateMachineArn :  job.featuresValues.stateMachine.id ,
      name : job.featuresValues.name,
      input : job.featuresValues.input
      }).promise();

    return Response.success({ executionId: data.executionArn });
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

    const stepfunctions = new AWS.StepFunctions({apiVersion: '2016-11-23'});
    
    await stepfunctions.stopExecution({
      executionArn : instance.payload.executionId,
      cause: "Terminating job from Saagie."
      }).promise();

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

    const stepfunctions = new AWS.StepFunctions({apiVersion: '2016-11-23'});
    
    const data = await stepfunctions.describeExecution({executionArn:instance.payload.executionId }).promise();
    const JOB_STATES = {
      RUNNING: JobStatus.RUNNING,
      SUCCEEDED: JobStatus.SUCCEEDED,
      ABORTED: JobStatus.KILLED,
      TIMED_OUT: JobStatus.FAILED,
      FAILED: JobStatus.FAILED,
    };
    return Response.success(JOB_STATES[data.status]);
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
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    // Get logstreamName
    const stepfunctions = new AWS.StepFunctions({apiVersion: '2016-11-23'});

    const data = await stepfunctions.describeStateMachineForExecution({executionArn: instance.payload.executionId }).promise();
    if (!data || !data.loggingConfiguration || !data.loggingConfiguration.destinations || !data.loggingConfiguration.destinations.length ) {
      return Response.empty('No logs available');
    }
    // Gather logs
    
    const logGroupNameArn = data.loggingConfiguration.destinations[0].cloudWatchLogsLogGroup.logGroupArn;
    const cwl = new AWS.CloudWatchLogs({apiVersion: '2014-03-28'});
    const logGroupName =  logGroupNameArn.split(":")[6];

    const logstream = await cwl.describeLogStreams({
      logGroupName: logGroupName,
      descending: true,
      limit: '1',
      orderBy: 'LastEventTime'
    }).promise();
    
    const params = {
      logGroupName: logGroupName,
      logStreamName: logstream.logStreams[0].logStreamName
    };
    const logs = await cwl.getLogEvents(params).promise();

    return Response.success(logs.events.map((item) => Log(item.message, Stream.STDOUT, new Date(item.timestamp*1000).toISOString())));
  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get log for job ${instance.payload.executionId}`, { error });
  }
};
