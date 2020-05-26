const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { JWT } = require('google-auth-library');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasets = async ({ featuresValues }) => {
  res = this.connect({ featuresValues: featuresValues });
  if (res.err)
    return res;
};

exports.connect = async ({ featuresValues }) => {
  try {
    // console.log("JSON Key: ", featuresValues.endpoint.jsonKey);
    // console.log("Project Name: ", featuresValues.endpoint.projectName);
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

    const client = new JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const url = `https://dns.googleapis.com/dns/v1/projects/${gcpKey.project_id}`;
    const res = await client.request({ url });

    console.log('Success! DNS Info:');
    console.log(res.data);

    return Response.error('Success! DNS Info:' + res.data, { res });
  } catch (error) {
    // dumpError(error);
    console.log('\nMessage: ' + error.message)
    return Response.error("Error:" + error.message, { error });
  }

  function dumpError(err) {
    if (typeof err === 'object') {
      if (err.message) {
        console.log('\nMessage: ' + err.message)
      }
      if (err.stack) {
        console.log('\nStacktrace:')
        console.log('====================')
        console.log(err.stack);
      }
    } else {
      console.log('dumpError :: argument is not an object');
    }
  }
}
