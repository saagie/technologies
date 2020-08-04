const { google } = require('googleapis');
const { Response } = require('@saagie/sdk');

export const getAuth = (gcpKey) => (
  new google.auth.JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
  })
);

export const getHeadersWithAccessToken = async (gcpKey) => {
  const auth = getAuth(gcpKey);

  const accessToken = await auth.getAccessToken();

  return {
    headers: { Authorization: `Bearer ${accessToken.token}` }
  };
};

export const getErrorMessage = (error, mainErrorMessage) => {
  if (error && error.response) {
    if (
      error.response.data
      && error.response.data.error
      && error.response.data.error.message
    ) {
      return Response.error(`${mainErrorMessage} : ${error.response.data.error.message}`, { error: new Error(error.response.data.error.message) });
    }

    return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
  }

  return Response.error(mainErrorMessage, { error });
};
