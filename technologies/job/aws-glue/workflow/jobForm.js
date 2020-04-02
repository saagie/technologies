const { Response } = require('@saagie/sdk');
const AWS = require('aws-sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkflows = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    var glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.listWorkflows().promise();
    
    if (!data || !data.Workflows || !data.Workflows.length) {
      return Response.empty('No jobs availables');
    }
    
    console.log(data);

    return Response.success(
      data.Workflows.map((value) => ({
        id: value,
        label: value,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve workflows", { error });
  }
};
