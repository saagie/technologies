const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const storage = google.storage('v1');
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
 * Function to retrieve buckets for a defined project.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getBuckets = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const auth = getAuth(gcpKey);

    const { data: { items: buckets } } = await storage.buckets.list({
      auth,
      project: featuresValues.project.id
    });

    if (!buckets || !buckets.length) {
      return Response.empty('No buckets availables')
    }

    return Response.success(
      buckets.map(({ id, name }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve buckets");
  }
};
