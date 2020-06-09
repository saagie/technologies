import { ERRORS_MESSAGES } from './errors';

const axios = require('axios');
const qs = require('querystring');
const { Response } = require('@saagie/sdk');

export const AZURE_MANAGEMENT_API_URL = 'https://management.azure.com';
export const AZURE_MANAGEMENT_CORE_API_URL = 'https://management.core.windows.net/';
export const AZURE_DATABRICKS_API_ID = '2ff814a6-3304-4ab8-85cb-cd0e6f879c1d';

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

export const getAccessTokenForManagementCoreResource = async (endpoint) => {
  const accessToken = await loginToAzureResource(endpoint, AZURE_MANAGEMENT_CORE_API_URL);

  return accessToken;
};

export const getHeadersWithAccessTokenForDatabricksResource = async (featuresValues) => {
  console.log({ featuresValues });
  const accessToken = await loginToAzureResource(featuresValues.endpoint, AZURE_DATABRICKS_API_ID);

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Databricks-Azure-Workspace-Resource-Id': featuresValues.workspace.id,
      'X-Databricks-Azure-SP-Management-Token': await getAccessTokenForManagementCoreResource(featuresValues.endpoint)
    }
  };
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
