const https = require('https');
const fs = require('fs');
const extract = require('extract-zip');
const rimraf = require('rimraf');

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


export const extractLogs = async (data, jobGroupId) => {
  const jobLogsFilePath = `/tmp/job-${jobGroupId}-logs.zip`;
  const jobLogsFolderPath = `/tmp/job-${jobGroupId}-logs`;

  if (fs.existsSync(jobLogsFilePath)) {
    fs.unlinkSync(jobLogsFilePath);
  }

  fs.appendFileSync(jobLogsFilePath, data);

  if (fs.existsSync(jobLogsFolderPath)) {
    rimraf.sync(jobLogsFolderPath);
  }

  await extract(jobLogsFilePath, { dir: '/tmp' });

  const directories = fs.readdirSync(jobLogsFolderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(dirName => Number(dirName));

  let logs = '';

  directories.forEach((dir) => {
    const newLogs = fs.readFileSync(`${jobLogsFolderPath}/${dir}/job.log`, 'utf8');
    logs += newLogs;
  });

  return logs.split('\n');
}