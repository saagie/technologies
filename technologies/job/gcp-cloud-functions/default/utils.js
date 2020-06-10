const { google } = require('googleapis');

export const getAuth = (gcpKey) => (
  new google.auth.JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
  })
);

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

