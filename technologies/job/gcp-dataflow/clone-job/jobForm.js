const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const cloudfunctions = google.cloudfunctions('v1');
const cloudresourcemanager = google.cloudresourcemanager('v1');
const dataflow = google.dataflow('v1b3');
const { getAuth, getErrorMessage } = require('../utils');

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
 * Function to retrieve regions options for a defined project.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getJobs = async ({ featuresValues }) => {
  const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

  try{
    const auth = getAuth(gcpKey);

    const { data: { jobs } } = await dataflow.projects.locations.jobs.list({
      auth,
      projectId : featuresValues.project.id,
      location: featuresValues.region.id,
    });

    if (!jobs || !jobs.length) {
      return Response.empty('No Dataflow jobs availables')
    }

    return Response.success(jobs.map(({ id, name }) => ({
      id: id,
      label: name,
    })));
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve Dataflow jobs");
  }
};
