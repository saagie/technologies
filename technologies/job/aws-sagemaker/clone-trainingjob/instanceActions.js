const AWS = require('aws-sdk');
const PAKO = require('pako')
const { Response, JobStatus, Log , Stream} = require('@saagie/sdk');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    if ( job.featuresValues.trainingjobname == null || job.featuresValues.trainingjobname.trim() === '' ) {
          return Response.error('Training Job name is required.', new Error("Validation Error"));
    }

    if ( job.featuresValues.trainingjobinput == null || job.featuresValues.trainingjobinput.trim() === '' ) {
          return Response.error('Training Job Input S3 location is required.', new Error("Validation Error"));
    }

    if ( job.featuresValues.trainingjoboutput == null || job.featuresValues.trainingjoboutput.trim() === '' ) {
          return Response.error('Training Job Output S3 location is required.', new Error("Validation Error"));
    }

    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});
    
    const sagemaker = new AWS.SageMaker({apiVersion: '2017-07-24'});
    console.log('Get Job Details',  job.featuresValues.trainingjobs.label)
    const data = await sagemaker.describeTrainingJob( params = {
      TrainingJobName: job.featuresValues.trainingjobs.label
    }).promise();

    console.log("Retrieved Template Job Details");
    console.log(data);

    console.log("Create New Job based on template parameters");
    const jparams = {
    AlgorithmSpecification:{
     TrainingInputMode: data.AlgorithmSpecification.TrainingInputMode,
     AlgorithmName: data.AlgorithmSpecification.AlgorithmName,
     EnableSageMakerMetricsTimeSeries: data.AlgorithmSpecification.EnableSageMakerMetricsTimeSeries,
     TrainingImage: data.AlgorithmSpecification.TrainingImage
    },
    OutputDataConfig: {
        S3OutputPath: job.featuresValues.trainingjoboutput
      },
    ResourceConfig: data.ResourceConfig,
    RoleArn: data.RoleArn,
    StoppingCondition: data.StoppingCondition,
    TrainingJobName: job.featuresValues.trainingjobname,
    DebugHookConfig: data.DebugHookConfig,
    DebugRuleConfigurations: data.DebugRuleConfigurations,
    EnableInterContainerTrafficEncryption: data.EnableInterContainerTrafficEncryption,
    EnableManagedSpotTraining: data.EnableManagedSpotTraining,
    EnableNetworkIsolation: data.EnableNetworkIsolation,
    ExperimentConfig: data.ExperimentConfig,
    HyperParameters: data.HyperParameters,
    InputDataConfig: [
        {
          ChannelName: 'train', /* required */
          DataSource: { /* required */
            S3DataSource: {
              S3DataType: 'S3Prefix',
              S3Uri:  job.featuresValues.trainingjobinput,
              S3DataDistributionType: 'FullyReplicated',
            }
          },
          CompressionType: 'None',
          InputMode: 'File'
        }
    ],
    Tags: data.Tags
    }

    const clone=await sagemaker.createTrainingJob(jparams).promise();

    console.log(clone);

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: clone.TrainingJobArn });
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
    
    const sagemaker = new AWS.SageMaker({apiVersion: '2017-07-24'});

    await sagemaker.stopTrainingJob({
      TrainingJobName: job.featuresValues.trainingjobname
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
    
    const sagemaker = new AWS.SageMaker({apiVersion: '2017-07-24'});
    console.log('Get Job Details',  job.featuresValues.trainingjobs.label)
    const data = await sagemaker.describeTrainingJob({
      TrainingJobName: job.featuresValues.trainingjobname
    }).promise();

    console.log(data)

    const JOB_STATES = {
      Stopping: JobStatus.KILLING,
      InProgress: JobStatus.RUNNING,
      Completed: JobStatus.SUCCEEDED,
      Stopped: JobStatus.KILLED,
      Failed: JobStatus.FAILED,
    };

    return Response.success(JOB_STATES[data.TrainingJobStatus]);
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
    
    const sagemaker = new AWS.SageMaker({apiVersion: '2017-07-24'});
    console.log('Get Job Details',  job.featuresValues.trainingjobs.label)
    const data = await sagemaker.describeTrainingJob({
      TrainingJobName: job.featuresValues.trainingjobname
    }).promise();

    const cloudwatchlogs = new AWS.CloudWatchLogs({apiVersion: '2014-03-28'});

    const logs = await cloudwatchlogs.filterLogEvents({
                                                  logGroupName: '/aws/sagemaker/TrainingJobs', /* required */
                                                  logStreamNamePrefix: job.featuresValues.trainingjobname, /* required */
                                                }).promise();


        return Response.success(logs.events.map((item) => Log(item.message, Stream.STDOUT, item.timestamp)));


  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get log for step`, { error });
  }
};
