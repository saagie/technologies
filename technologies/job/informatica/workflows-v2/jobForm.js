const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { ERRORS_MESSAGES } = require('../errors');
const { loginUser, getV2RequestHeadersFromEndpointForm, getErrorMessage } = require('./utils');

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
        `${userData.serverUrl}/api/v2/workflow`,
        getV2RequestHeadersFromEndpointForm(userData)
      );

      if (!result || !result.data) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data: workflows } = result;

      if (!workflows || !workflows.length) {
        return Response.empty(ERRORS_MESSAGES.NO_WORKFLOWS);
      }

      return Response.success(
        workflows.map(({ name, id, tasks }) => ({
          id,
          label: name,
          tasks,
        }))
      );
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.WORKFLOWS_ERROR);
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getTasks = async ({ featuresValues }) => {
  if (
    featuresValues
    && featuresValues.workflow
    && featuresValues.workflow.tasks
    && featuresValues.workflow.tasks.length > 0
  ) {
    return Response.success(
      featuresValues.workflow.tasks.map(({ name, taskId, type }) => ({
        id: taskId,
        label: name,
        type,
      }))
    );
  }

  return Response.empty(ERRORS_MESSAGES.NO_TASKS);
};
