import { ERRORS_MESSAGES } from './errors';

const axios = require('axios');
const qs = require('querystring');
const { Response } = require('@saagie/sdk');

export const AZURE_MANAGEMENT_API_URL = 'https://management.azure.com';

const loginToAzureResource = async (endpoint, resourceUrl) => {
  const {
    clientId,
    clientSecret,
    tenantId,
  } = endpoint;

  const loginRequestBody = {
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret,
    resource: resourceUrl,
  };
  
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  const { data } = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/token`,
    qs.stringify(loginRequestBody),
    config
  );

  const { access_token: accessToken } = data;

  return accessToken;
};

export const getHeadersWithAccessTokenForManagementResource = async (endpoint) => {
  const accessToken = await loginToAzureResource(endpoint, AZURE_MANAGEMENT_API_URL);

  return {
    headers: { Authorization: `Bearer ${accessToken}` }
  };
};

export const getRegionalApiServer = async (workspace) => {
  const { data } = await axios.get(workspace.properties.discoveryUrl);

  return data.api;
};

export const getExperimentsApiServer = async (workspace) => {
  const { data } = await axios.get(workspace.properties.discoveryUrl);

  return data.experimentation;
};

export const checkDataFromAzureResponse = (response) => (
  response
    && response.data
    && response.data.value
    && response.data.value.length > 0
);

const UNAUTHORIZED_CLIENT = 'unauthorized_client';

export const getErrorMessage = (error, mainErrorMessage) => {
  if (error && error.response) {

    if (
      error.response.data
      && error.response.data.error
    ) {
      if (error.response.status === 400 && error.response.data.error === UNAUTHORIZED_CLIENT) {
        return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(error.response.data.error) });
      }

      return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(error.response.data.error) });
    }

    return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
  }

  return Response.error(mainErrorMessage, { error });
}

// Function to convert base 64 string to file (Temporary until artifact field type is available)
export const dataBase64toFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n - 1] = bstr.charCodeAt(n - 1);
    n -= 1;
  }
  return new File([u8arr], filename, { type: mime });
}
