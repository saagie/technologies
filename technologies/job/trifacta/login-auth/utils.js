const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

export const getRequestConfigFromEndpointForm = (endpointForm) => (
  {
    httpsAgent: endpointForm.ignoreSslIssues && endpointForm.ignoreSslIssues.id ? agent : null,
    auth: {
      username: endpointForm.email,
      password: endpointForm.password
    }
  }
);
