const { google } = require('googleapis');

exports.getConnexion = (gcpKey) => {
    authClient = new google.auth.JWT({
        email: gcpKey.client_email,
        key: gcpKey.private_key,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      return authClient;
}