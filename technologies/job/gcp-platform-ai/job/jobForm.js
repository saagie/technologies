const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const ml = google.ml('v1');
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
 * Example of function to retrieve AI Platform jobs into selected project.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getJobs = async ({ featuresValues }) => {
  try {
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

    const auth = getAuth(gcpKey);

    const { data: { jobs } } = await ml.projects.jobs.list({
      auth,
      parent: `projects/${featuresValues.project.id}`
    });

    return Response.success(
      jobs.map((job) => ({
        id: job.jobId,
        label: job.jobId,
        data: job,
      })),
    );
  } catch (error) {
    return getErrorMessage(error, "Can't retrieve jobs");
  }
};
