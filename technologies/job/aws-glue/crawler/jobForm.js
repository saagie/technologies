const { Response } = require('@saagie/sdk');
const AWS = require('aws-sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getCrawlers = async ({ featuresValues }) => {
  try {
    AWS.config.update({credentials: { accessKeyId : featuresValues.endpoint.aws_access_key_id, secretAccessKey:  featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: featuresValues.endpoint.region});

    var glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.getCrawlers().promise();
    
     
    if (!data || !data.Crawlers || !data.Crawlers.length) {
      return Response.empty('No crawlers availables');
    }
    
    return Response.success(
      data.Crawlers.map(({ Name }) => ({
        id: Name,
        label: Name,
      })),
    );
  } catch (error) {
    console.log(error);
    return Response.error("Can't retrieve crawlers", { error });
  }
};
