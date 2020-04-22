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
    
    const emr = new AWS.EMR({apiVersion: '2009-03-31'});

    const data = await emr.describeStep( params = {
      ClusterId: job.featuresValues.clusters.id, 
      StepId: job.featuresValues.steps.id
    }).promise();

    const clonestep={
      Name : job.featuresValues.name,
      HadoopJarStep: { 
        Jar: data.Step.Config.Jar,
      }
    };
    if (data.Step.Config.Args && data.Step.Config.Args.length>0) {
      clonestep.HadoopJarStep.Args = data.Step.Config.Args;
    }
    if (data.Step.Config.MainClass) {
      clonestep.HadoopJarStep.MainClass = data.Step.Config.MainClass;
    }
    if (data.Step.Config.Properties && Object.keys(data.Step.Config.Properties).length > 0) {
      clonestep.HadoopJarStep.Properties = [ data.Step.Config.Properties ];
    }
    if (data.Step.ActionOnFailure) {
      clonestep.ActionOnFailure = data.Step.ActionOnFailure;
    }

    const clone=await emr.addJobFlowSteps( params = {
      JobFlowId: job.featuresValues.clusters.id, 
      Steps: [ clonestep ]
    }).promise();

    console.log(clone);

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: clone.StepIds[0] });
  } catch (error) {
    console.log(error);
    return Response.error('Fail to clone & start step', { error });
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
    
    const emr = new AWS.EMR({apiVersion: '2009-03-31'});

    await emr.cancelSteps( params = {
      ClusterId: job.featuresValues.clusters.id, 
      StepIds: [ instance.payload.customId ]
    }).promise();

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
    
    var emr = new AWS.EMR({apiVersion: '2009-03-31'});

    const data = await emr.describeStep( params = {
      ClusterId: job.featuresValues.clusters.id, 
      StepId: instance.payload.customId
    }).promise();
    
    const JOB_STATES = {
      PENDING: JobStatus.QUEUED,
      CANCEL_PENDING: JobStatus.KILLING,
      RUNNING: JobStatus.RUNNING,
      COMPLETED: JobStatus.SUCCEEDED,
      CANCELLED: JobStatus.KILLED,
      FAILED: JobStatus.FAILED,
      INTERRUPTED: JobStatus.FAILED
    };

    return Response.success(JOB_STATES[data.Step.Status.State]);
  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get status for dataset`, { error });
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
    
    const emr = new AWS.EMR({apiVersion: '2009-03-31'});

    const data = await emr.describeCluster( params = {
      ClusterId: job.featuresValues.clusters.id
    }).promise();

    const s3uri = `${data.Cluster.LogUri}${job.featuresValues.clusters.id}/steps/${instance.payload.customId}/`;
    console.log(s3uri);

    const urisplitted = s3uri.split('/');
    const bucket = urisplitted[2];
    const key = s3uri.substring(7+bucket.length);

    console.log(bucket);
    console.log(key);

    const s3 = new AWS.S3({apiVersion: '2006-03-01'});

    const directory=await s3.listObjectsV2({
      Bucket: bucket, 
      Prefix: key,
     }).promise();

     console.log(directory.Contents.map((item) => {return item.Key}));

    //return Response.success(data.logs.map((item) => Log(item.log, item.output, item.time)));
  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get log for step`, { error });
  }
};
