const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudfunctions = google.cloudfunctions('v1');
const { getConnexion } = require('./utils');

/**
 * Function to retrieve locations options for a defined project.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getLocations = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.jsonKey);

  try{
    authClient = getConnexion(gcpKey);
    const { data: { locations } } = await cloudfunctions.projects.locations.list({
      auth: authClient,
      name : "projects/saagie-internal-testing",
    });

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