const axios = require('axios');
const qs = require('querystring');

export const getHeadersWithAccessTokenForManagementResource = async (endpoint) => {
  const {
    clientId,
    clientSecret,
    tenantId,
  } = endpoint;

  const loginRequestBody = {
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret,
    resource: 'https://management.azure.com'
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

  return {
    headers: { Authorization: `Bearer ${accessToken}` }
  };
};

export const getHeadersWithAccessTokenForInsightsResource = async (endpoint) => {
  const {
    clientId,
    clientSecret,
    tenantId,
  } = endpoint;

  const loginRequestBody = {
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret,
    resource: 'https://api.applicationinsights.io'
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

  return {
    headers: { Authorization: `Bearer ${accessToken}` }
  };
};
