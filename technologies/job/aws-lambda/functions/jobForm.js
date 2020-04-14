
const { Response } = require('@saagie/sdk');
const AWS = require('aws-sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFunctions = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});

    const data = await lambda.listFunctions().promise();

    if (!data.Functions || !data.Functions.length) {
      return Response.empty('No functions availables');
    }

    var functionsList = data.Functions.map(({ FunctionName, FunctionArn }) => ({
      id: FunctionArn,
      label: FunctionName,
    }));

    console.log(functionsList);

    const filteredFunctions = functionsList.map(
      ({id, label}) =>
        lambda.listEventSourceMappings({FunctionName : id }).promise().then(function(data) {
          if (data.EventSourceMappings && data.EventSourceMappings.length>0) {
            return ({
              id: id,
              label: label,
              sourceId: data.EventSourceMappings.map((UUID) => (UUID)),
            })
          } else {
            return ({
              id: id,
              label: label
            })
          }
    }));

    const functions=(await Promise.all(filteredFunctions)).filter(item => (item.sourceId && item.sourceId.length>0));
    console.log(functions);

    return Response.success(functions);
  } catch (error) {
    return Response.error("Can't retrieve functions", { error });
  }
};
