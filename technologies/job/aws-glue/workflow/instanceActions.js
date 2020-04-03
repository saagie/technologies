const { Response, JobStatus } = require('@saagie/sdk');
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

    const glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.startWorkflowRun({ Name: job.featuresValues.workflow.id }).promise(); // throw error here

    return Response.success({ glueWorkflowId: data.RunId });
  } catch (error) {
    return Response.error('Fail to start job', { error });
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

    const glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.getWorkflowRun({ Name: job.featuresValues.workflow.id, RunId: instance.payload.glueWorkflowId }).promise();

    switch (data.Run.Status) {
      case 'RUNNING':
        return Response.success(JobStatus.RUNNING);
      case 'COMPLETED':
        return Response.success(JobStatus.SUCCEEDED);
    }
  } catch (error) {
    return Response.error(`Failed to get status for instance ${instance}`, { error });
  }
};
