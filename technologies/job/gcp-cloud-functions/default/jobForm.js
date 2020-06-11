const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudfunctions = google.cloudfunctions('v1');
const cloudresourcemanager = google.cloudresourcemanager('v1');
const { getAuth, getErrorMessage } = require('./utils');

/**
 * Function to retrieve projects for the authenticated user.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getProjects = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const auth = getAuth(gcpKey);

    const { data: { projects } } = await cloudresourcemanager.projects.list({
      auth,
    });

    if (!projects || !projects.length) {
      return Response.empty('No projects availables')
    }
    
    return Response.success(
      projects.map(({ projectId, name }) => ({
        id: projectId,
        label: name,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve projects");
  }
};

/**
 * Function to retrieve regions options for a defined project.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getRegions = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const auth = getAuth(gcpKey);

    const { data: { locations } } = await cloudfunctions.projects.locations.list({
      auth,
      name : `projects/${featuresValues.project.id}`,
    });

    if (!locations || !locations.length) {
      return Response.empty('No regions availables')
    }
    
    return Response.success(
      locations.map(({locationId}) => ({
        id: locationId,
        label: locationId,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve regions");
  }
};

/**
 * Function to retrieve available functions.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFunctions = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try {
    const auth = getAuth(gcpKey);
    const { data: { functions } } = await cloudfunctions.projects.locations.functions.list({
      auth,
      parent : `projects/${featuresValues.project.id}/locations/${featuresValues.region.id}`,
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
    return getErrorMessage(error, "Can't retrieve GCP Cloud Functions");
  }
};