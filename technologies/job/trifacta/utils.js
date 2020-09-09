const https = require('https');
const AdmZip = require('adm-zip');

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


export const extractLogs = async (data) => {
	const zip = new AdmZip(data);
  const zipEntries = zip.getEntries();

  let logsLines = [];

	zipEntries.forEach((zipEntry) => {
    if (zipEntry && zipEntry.entryName.includes('job.log')) {

      const fileData = zipEntry.getData();

      const logsContent = fileData.toString('utf8');

      logsLines = logsLines.concat(logsContent.split('\n'));
    }
  });

  return logsLines;
}