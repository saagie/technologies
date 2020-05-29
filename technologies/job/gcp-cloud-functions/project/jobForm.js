const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudfunctions = google.cloudfunctions('v1');
const { getConnexion } = require('./utils');

/**
 * Function to retrieve available functions.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFunctions = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try {
    authClient = getConnexion(gcpKey);
    const { data: { functions } } = await cloudfunctions.projects.locations.functions.list({
      auth: authClient,
      parent : `projects/saagie-internal-testing/locations/${featuresValues.endpoint.location.id}`,
    });
    
    if (!functions || !functions.length) {
      return Response.empty('No functions availables')
    }

    return Response.success(
      functions.map(({ name }) => {
        arrName = name.split("/")
        return {id: name, label: arrName[arrName.length - 1]}
      }),
    );
  } catch (error) {
    return Response.error("Can't retrieve GCP Cloud Functions", { error })
  }
};