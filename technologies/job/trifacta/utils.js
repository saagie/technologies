const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

export const getRequestConfigFromEndpointForm = (endpointForm) => {
  if (endpointForm && endpointForm.email && endpointForm.password) {
    return ({
      httpsAgent: endpointForm.ignoreSslIssues && endpointForm.ignoreSslIssues.id ? agent : null,
      auth: {
        username: endpointForm.email,
        password: endpointForm.password
      }
    });
  }

  if (endpointForm && endpointForm.access_token) {
    return ({
      httpsAgent: endpointForm.ignoreSslIssues && endpointForm.ignoreSslIssues.id ? agent : null,
      headers: {
        'Authorization': `Bearer ${endpointForm.access_token}`
      }
    });
  }

  return {};
}
