const { Response } = require('@saagie/sdk');
const AWS = require('aws-sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getClusters = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    var emr = new AWS.EMR({apiVersion: '2009-03-31'});

    const data = await emr.listClusters().promise();
    
    if (!data || !data.Clusters || !data.Clusters.length) {
      return Response.empty('No clusters availables');
    }
    
    return Response.success(
      data.Clusters.map(({ Id, Name }) => ({
        id: Id,
        label: Name,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve clusters", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getSteps = async ({ featuresValues }) => {
  try {
    console.log("Get Steps");
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    var emr = new AWS.EMR({apiVersion: '2009-03-31'});

    const data = await emr.listSteps({ ClusterId: featuresValues.clusters.id }).promise();
    
    if (!data || !data.Steps || !data.Steps.length) {
      return Response.empty('No steps availables');
    }
    
    return Response.success(
      data.Steps.map(({ Id, Name }) => ({
        id: Id,
        label: Name,
      })),
    );
  } catch (error) {
    console.log(error);
    return Response.error("Can't retrieve steps", { error });
  }
};
