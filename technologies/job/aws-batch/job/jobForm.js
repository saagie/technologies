const AWS = require('aws-sdk');
const { Response } = require('@saagie/sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getJobs = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    var batch = new AWS.Batch({apiVersion: '2016-08-10'});

    const data = await batch.describeJobDefinitions({ status: "ACTIVE" }).promise();
    
    if (!data || !data.jobDefinitions || !data.jobDefinitions.length) {
      return Response.empty('No job definitions availables');
    }
    
    return Response.success(
      data.jobDefinitions.map(({ jobDefinitionArn, jobDefinitionName }) => ({
        id: jobDefinitionArn,
        label: jobDefinitionName,
      })),
    );
  } catch (error) {
    console.log(error);
    return Response.error("Can't retrieve job definitions", { error });
  }
};

exports.getJobQueues = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    var batch = new AWS.Batch({apiVersion: '2016-08-10'});

    const data = await batch.describeJobQueues().promise();
    
    if (!data || !data.jobQueues || !data.jobQueues.length) {
      return Response.empty('No job definitions availables');
    }
    
    return Response.success(
      data.jobQueues.map(({ jobQueueName, jobQueueArn }) => ({
        id: jobQueueArn,
        label: jobQueueName,
      })),
    );
  } catch (error) {
    console.log(error);
    return Response.error("Can't retrieve job definitions", { error });
  }
};