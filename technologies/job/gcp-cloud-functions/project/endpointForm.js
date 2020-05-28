const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { google } = require("googleapis");
const cloudfunctions = google.cloudfunctions('v1');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getLocations = async ({ featuresValues }) => {
  try{
    console.log(featuresValues)
    const gcpKey = JSON.parse(featuresValues.jsonKey);
    console.log(gcpKey);

    authClient = new google.auth.JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const { data: { locations } } = await cloudfunctions.projects.locations.list({
      auth: authClient,
      name : "projects/saagie-internal-testing",
    });
    console.log(locations);
    if (!locations || !locations.length) {
      return Response.empty('No locations availables')
    }
    return Response.success(
      locations.map(({locationId}) => ({
        id: locationId,
        label: locationId,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve locations", { error });
  }
};