const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { ERRORS_MESSAGES } = require('../errors');
const { loginUser, getV2RequestHeadersFromEndpointForm, getErrorMessage } = require('./utils');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getTasks = async ({ featuresValues }) => {
  try {
    const userData = await loginUser(featuresValues);

    if (userData && userData.icSessionId && userData.serverUrl) {
      const result = await axios.get(
        `${userData.serverUrl}/api/v2/task?type=${featuresValues.taskType.id}`,
        getV2RequestHeadersFromEndpointForm(userData)
      );

      if (!result || !result.data) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data: tasks } = result;

      if (!tasks || !tasks.length) {
        return Response.empty(ERRORS_MESSAGES.NO_TASKS);
      }

      return Response.success(
        tasks.map(({ name, id }) => ({
          id,
          label: name,
        }))
      );
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.TASKS_ERROR);
  }
};
