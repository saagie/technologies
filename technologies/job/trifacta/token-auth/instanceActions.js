const axios = require('axios');
const https = require('https');
const fs = require('fs');
const extract = require('extract-zip');
const rimraf = require('rimraf');
const { Response, JobStatus, Log } = require('@saagie/sdk');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    const parameters = [];

    if (job.featuresValues.first_parameter_key && job.featuresValues.first_parameter_value) {
      parameters.push({
        key: job.featuresValues.first_parameter_key,
        value: job.featuresValues.first_parameter_value
      });
    }

    if (job.featuresValues.second_parameter_key && job.featuresValues.second_parameter_value) {
      parameters.push({
        key: job.featuresValues.second_parameter_key,
        value: job.featuresValues.second_parameter_value
      });
    }

    const { data } = await axios.post(
      `${job.featuresValues.endpoint.url}/v4/jobGroups`,
      {
        wrangledDataset: {
          id: job.featuresValues.dataset.id,
        },
        runParameters: {
          overrides: {
            data: parameters
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${job.featuresValues.endpoint.access_token}`
        }
      }
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ jobGroupId: data.id });
  } catch (error) {
    return Response.error('Fail to start job', { error });
  }
};

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET STATUS INSTANCE:', instance);

    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/v4/jobGroups/${instance.payload.jobGroupId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${job.featuresValues.endpoint.access_token}`
        }
      }
    );

    switch (data) {
      case 'Created':
        return Response.success(JobStatus.QUEUED);
      case 'Pending':
        return Response.success(JobStatus.QUEUED);
      case 'InProgress':
        return Response.success(JobStatus.RUNNING);
      case 'Complete':
        return Response.success(JobStatus.SUCCEEDED);
      case 'Canceled':
        return Response.success(JobStatus.KILLED);
      case 'Failed':
        return Response.success(JobStatus.FAILED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};

/**
 * Logic to retrieve the external job instance logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET LOG INSTANCE:', instance);

    const result = await axios.get(
      `${job.featuresValues.endpoint.url}/v4/jobGroups/${instance.payload.jobGroupId}/logs`,
      {
        headers: {
          'Authorization': `Bearer ${job.featuresValues.endpoint.access_token}`
        },
        responseType: 'arraybuffer'
      }
    );

    const jobLogsFilePath = `/tmp/job-${instance.payload.jobGroupId}-logs.zip`;
    const jobLogsFolderPath = `/tmp/job-${instance.payload.jobGroupId}-logs`;

    const { data } = result;

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

    const logsLines = logs.split('\n');

    return Response.success(logsLines.map((line) => {
      const logDate = line.substring(0, 23);
      const logContent = line.substring(24);
      return Log(logContent, null, logDate);
    }));
  } catch (error) {
    return Response.error(`Failed to get log for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
