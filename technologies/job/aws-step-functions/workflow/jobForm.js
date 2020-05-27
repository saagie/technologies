const AWS = require('aws-sdk');
const { Response } = require('@saagie/sdk');

/**
 * Retrieve available state machines for the given AWS credentials
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getStateMachines = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    const stepfunctions = new AWS.StepFunctions({apiVersion: '2016-11-23'});

    const data = await stepfunctions.listStateMachines().promise();
    
    if (!data || !data.stateMachines || !data.stateMachines.length) {
      return Response.empty('No State Machines available');
    }
    
    return Response.success(
      data.stateMachines.map(({ stateMachineArn, name }) => ({
        id: stateMachineArn,
        label: name,
      })),
    );
  } catch (error) {
    console.log(error);
    return Response.error("Can't retrieve State Machines", { error });
  }
};
