const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { google } = require("googleapis");
const cloudfunctions = google.cloudfunctions('v1');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFunctions = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);
  console.log(gcpKey);
  console.log(featuresValues.endpoint.location);

  try {
    authClient = new google.auth.JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const { data: { functions } } = await cloudfunctions.projects.locations.functions.list({
      auth: authClient,
      parent : `projects/saagie-internal-testing/locations/${featuresValues.endpoint.location.id}`,
    });
    console.log(functions);
    if (!functions || !functions.length) {
      return Response.empty('No functions availables')
    }
    return Response.success(
      functions.map(({ name }) => ({
        id: name,
        label: name,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve GCP Cloud Functions", { error })
  }
};