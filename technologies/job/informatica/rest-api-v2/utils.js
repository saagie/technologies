const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { ERRORS_MESSAGES } = require('../errors');

export const getV2RequestHeadersFromEndpointForm = (userData) => (
  { headers: { icSessionId: userData.icSessionId } }
);

export const loginUser = async (featuresValues) => {
  const resultLogin = await axios.post(
    `${featuresValues.endpoint.url}/ma/api/v2/user/login`,
    {
      username: featuresValues.endpoint.username,
      password: featuresValues.endpoint.password,
    }
  );

  if (!resultLogin || !resultLogin.data) {
    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  }

  const { data: userData } = resultLogin;

  return userData;
};

export const getErrorMessage = (error, mainErrorMessage) => {
  if (error && error.response) {
    if (
      error.response.data
      && error.response.data['@type'] === 'error'
    ) {
      return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(error.response.data.description) });
    }

    return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
  }

  return Response.error(mainErrorMessage, { error });
}
