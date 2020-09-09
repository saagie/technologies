const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudresourcemanager = google.cloudresourcemanager('v1');
const run = google.run('v1');
const axios = require('axios');
const { getAuth, getErrorMessage, getHeadersWithAccessToken } = require('../utils');

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

    const { data: { locations } } = await run.projects.locations.list({
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
 * Function to retrieve services for the authenticated user.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getServices = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const { data: { items: services } } = await axios.get(
      `https://${featuresValues.region.id}-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/${featuresValues.project.id}/services`,
      await getHeadersWithAccessToken(gcpKey),
    );

    if (!services || !services.length) {
      return Response.empty('No services availables')
    }

    return Response.success(
      services.map((service) => ({
        id: service.metadata.name,
        label: service.metadata.name,
        data: service,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve services");
  }
};
