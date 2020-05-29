const { Response } = require('@saagie/sdk');
const AWS = require('aws-sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getTrainingJobs = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});
    const sagemaker = new AWS.SageMaker();
    const data = await sagemaker.listTrainingJobs().promise();

    // console.log(data);
    
    if (!data || !data.TrainingJobSummaries || !data.TrainingJobSummaries.length) {
      return Response.empty('No Jobs Available to clone.');
    }
    
    return Response.success(
      data.TrainingJobSummaries.map(({ TrainingJobArn, TrainingJobName }) => ({
        id: TrainingJobArn,
        label: TrainingJobName,
      })),
    );
  } catch (error) {
    console.log(error)
    return Response.error("Can't retrieve Training Jobs", { error });
  }
};