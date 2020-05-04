const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { ERRORS_MESSAGES } = require('../errors');
const {
  loginUser,
  getV3RequestHeadersFromEndpointForm,
  getV2RequestHeadersFromEndpointForm,
  getErrorMessage,
} = require('../utils');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getProjects = async ({ featuresValues }) => {
  try {
    const userData = await loginUser(featuresValues);

    if (userData && userData.icSessionId && userData.serverUrl) {
      const result = await axios.get(
        `${userData.serverUrl}/public/core/v3/objects?q=type=='Project'`,
        getV3RequestHeadersFromEndpointForm(userData)
      );

      if (!result || !result.data || !result.data.objects) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data } = result;

      const { objects: projects } = data;

      if (!projects || !projects.length) {
        return Response.empty(ERRORS_MESSAGES.NO_PROJECTS);
      }
  
      return Response.success(
        projects.map(({ path, id }) => ({
          id,
          path,
          label: path,
        })),
      );
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    if (error && error.response) {
      if (error.response.status === 401) {
        return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      if (error.response.status === 404) {
        return Response.error(ERRORS_MESSAGES.RESOURCE_NOT_FOUND_ERROR, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      return Response.error(`${ERRORS_MESSAGES.PROJECTS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.PROJECTS_ERROR, { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFolders = async ({ featuresValues }) => {
  try {
    const userData = await loginUser(featuresValues);

    const projectMainFolder = {
      id: featuresValues.project.id,
      path: featuresValues.project.path,
      label: `${featuresValues.project.path}/`,
    }

    if (userData && userData.icSessionId && userData.serverUrl) {
      const result = await axios.get(
        `${userData.serverUrl}/public/core/v3/objects?q=type=='Folder' and location=='${featuresValues.project.path}'`,
        getV3RequestHeadersFromEndpointForm(userData)
      );

      if (!result || !result.data || !result.data.objects) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data } = result;

      const { objects: folders } = data;

      if (!folders || !folders.length) {
        return Response.success([projectMainFolder]);
      }
  
      return Response.success(
        [
          projectMainFolder,
          ...folders.map(({ path, id }) => ({
            id,
            path,
            label: path,
          })),
        ]
      );
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FOLDERS_ERROR);
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkflows = async ({ featuresValues }) => {
  try {
    const userData = await loginUser(featuresValues);

    if (userData && userData.icSessionId && userData.serverUrl) {
      const result = await axios.get(
        `${userData.serverUrl}/public/core/v3/objects?q=type=='WORKFLOW' and location=='${featuresValues.folder.path}'`,
        getV3RequestHeadersFromEndpointForm(userData)
      );

      if (!result || !result.data || !result.data.objects) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data } = result;

      const { objects: workflows } = data;

      if (!workflows || !workflows.length) {
        return Response.empty(ERRORS_MESSAGES.NO_WORKFLOWS);
      }
  
      return Response.success(
        workflows.map(({ path, id }) => ({
          id,
          path,
          label: path,
        }))
      );
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.WORKFLOWS_ERROR);
  }
};
